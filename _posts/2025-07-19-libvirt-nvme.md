---
layout: post
title: "KVM with emulated nvme drive"
date:   2025-07-19 01:00:00 -0800
categories: tech
draft: false
pinned: false
short: Configure libvirt to run a VM with an emulated NVME
---

I wanted to test provisioning Rocky Linux to a target with an NVME root disk. I found some instructions on [another blog](https://blog.christophersmart.com/2019/12/18/kvm-guests-with-emulated-ssd-and-nvme-drives/) but had to tweak it slightly to get it working on my ubuntu machine running libvirt 10.0.0 so I thought I'd share my steps.

Specifically, I was testing
* Running PXE on my host machine using dnsmasq as the dhcp/tftp server
* Using the Rocky Linux attended installation flow

0/ Setup - only needed if you're doing PXE boot

I configured the default network to disable dhcp so that I could use my local dnsmasq instance to serve PXE.

```sh
# virsh net-edit default
<network>
  <name>default</name>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:22:80:9b'/>
  <!-- Note that you need to set dns enable=no to disable the built-in dnsmasq and use your host -->
  <dns enable='no'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
  </ip>
</network>
```

Example dnsmasq conf for my network. I'm use iPXE chainloading and built the .efi and .ipxe files from the ipxe repo.
```sh
# cat /etc/dnsmasq.conf

interface=virbr0
listen-address=192.168.122.1
bind-interfaces
enable-tftp
tftp-root=/var/lib/tftpboot
log-debug
dhcp-match=set:ipxe,175 # gPXE/iPXE sends a 175 option.
server=1.1.1.1
#dhcp-boot=tag:!ipxe,undionly.kpxe  # BIOS boot
dhcp-boot=tag:!ipxe,ipxe.efi        # UEFI boot
dhcp-boot=tag:ipxe,bootstrap.ipxe

dhcp-option=3,192.168.122.1          # gateway
dhcp-option=6,192.168.122.1          # DNS server

dhcp-range=192.168.122.180,192.168.122.200,255.255.255.0,12h

log-queries
log-dhcp
```

```
# cat /var/lib/tftpboot/bootstrap.ipxe
#!ipxe
dhcp
kernel http://192.168.122.1/rocky8/images/pxeboot/vmlinuz initrd=initrd.img inst.repo=http://192.168.122.1/rocky8
initrd http://192.168.122.1/rocky8/images/pxeboot/initrd.img
boot
```

I'd also copied the rocky linux installation media from the ISO image to `/var/www/html/` to was serving over apache for the kickstart process.

```sh
# ls -al  /var/www/html/
total 3715052
drwxr-xr-x 3 root root        4096 Jun 28 13:34 .
drwxr-xr-x 3 root root        4096 Jun 28 11:20 ..
dr-xr-xr-x 7 root root        4096 May 27  2024 rocky8

# ls -al  /var/www/html/rocky8
total 48
dr-xr-xr-x 7 root root 4096 May 27  2024 .
drwxr-xr-x 3 root root 4096 Jun 28 13:34 ..
drwxr-xr-x 4 root root 4096 May 27  2024 BaseOS
-r--r--r-- 1 root root   46 May 27  2024 .discinfo
dr-xr-xr-x 3 root root 4096 May 27  2024 EFI
dr-xr-xr-x 3 root root 4096 May 27  2024 images
drwxrwxr-x 2 root root 4096 May 27  2024 isolinux
-rw-r--r-- 1 root root 2204 Apr  3  2024 LICENSE
-r--r--r-- 1 root root   89 May 27  2024 media.repo
drwxr-xr-x 3 root root 4096 May 27  2024 Minimal
-r--r--r-- 1 root root  219 May 27  2024 TRANS.TBL
-r--r--r-- 1 root root 1500 May 27  2024 .treeinfo

```


1/ Make a backing file for the simulated NVME

A 16G image...

```sh
dd if=/dev/zero of=/var/lib/libvirt/images/nvme001.img bs=1M count=16384
```

2/ Create a domain

I then created a base domain definition and tweaked it using `virsh edit`

```sh
virt-install \
  --name rocky-pxe \
  --ram 4096 \
  --vcpus 2 \
  --network bridge=virbr0,model=virtio \
  --boot network \
  --os-variant rocky8 \
  --print-xml > rocky-pxe.xml

# edit the rocky-pxe.xml
# then

virsh define rocky-pxe.xml

# or you can load the generated rocky-pxe.xml and use `virsh edit rocky-pxe`
```

The key edits to get this work work were these sections
1. add the element `xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'` to the domain tag
2. add the `<qemu:commandline>` section after `<devices/>` with the NVME details included
3. set the os `firmware='efi'`. On saving in `virsh edit` and re-opening in `virsh edit`, the firmware section appeared. I had to set this to disable secure boot and change the `<loader>` and `<nvram>` sections to use the firmware paths without `.ms.` in the file path. This avoids a "permission denied" error that the UEFI loader will display after downloading the .efi file. You may have luck using a signed .efi file and using secureboot
4. remove the automatically added `<disk>` device

Step (3) is needed because the BIOS in my libvirt version didn't recognize NVME drives as a bootable device.

The final XML will look something like this:


```xml
<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>
  <name>rocky-nvme</name>
  <!-- snip -->
  <os firmware='efi'>
    <type arch='x86_64' machine='pc-q35-8.2'>hvm</type>
    <firmware>
      <feature enabled='no' name='enrolled-keys'/>
      <feature enabled='no' name='secure-boot'/>
    </firmware>
    <loader readonly='yes' secure='no' type='pflash'>/usr/share/OVMF/OVMF_CODE_4M.fd</loader>
    <nvram template='/usr/share/OVMF/OVMF_VARS_4M.fd'>/var/lib/libvirt/qemu/nvram/rocky-nvme_VARS.fd</nvram>
    <boot dev='network'/>
    <bootmenu enable='yes'/>
  </os>
  <devices>
    <!-- snip -->
  </devices>
  <seclabel type='dynamic' model='dac' relabel='yes'/>
  <qemu:commandline>
    <qemu:arg value='-drive'/>
    <qemu:arg value='file=/var/lib/libvirt/images/nvme001.img,format=raw,if=none,id=NVME1'/>
    <qemu:arg value='-device'/>
    <qemu:arg value='nvme,drive=NVME1,serial=1234,addr=0x04'/>
  </qemu:commandline>
</domain>
```

Then running

```sh
virsh start rocky-pxe
virt-viewer rocky-pxe
```

Opened up the visual OS installer. I installed Rocky and then changed the boot mode on the VM to `dev='hd'` and restarted the domain.

Now I have a running VM with an NVME.

```sh
[root@localhost ~]# lsblk
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
nvme0n1     259:0    0   16G  0 disk
├─nvme0n1p1 259:1    0  600M  0 part /boot/efi
├─nvme0n1p2 259:2    0    1G  0 part /boot
└─nvme0n1p3 259:3    0 14.4G  0 part
  ├─rl-root 253:0    0 12.8G  0 lvm  /
  └─rl-swap 253:1    0  1.6G  0 lvm  [SWAP]

```

And that's it. Next I'm thinking to try this flow but serving the installation media and dhcp on another VM to keep my host machine tidy.