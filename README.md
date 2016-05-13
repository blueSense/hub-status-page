# Status page

## Overview

The status page is meant to show an overall status for the device.

The overall idea is to have a frontend page which is connected to the backend via websockets.

The system is scanned in regular intervals and when a change occurs an event emitted to all clients.
