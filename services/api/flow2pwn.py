#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This file is part of Flower.
#
# Copyright ©2018 Nicolò Mazzucato
# Copyright ©2018 Antonio Groza
# Copyright ©2018 Brunello Simone
# Copyright ©2018 Alessio Marotta
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
#
# Flower is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Flower is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Flower.  If not, see <https://www.gnu.org/licenses/>.

import base64

from database import FlowDetail


def escape(i):
    if isinstance(i, str):
        i = ord(i)
    ret = chr(i) if 0x20 <= i and i < 0x7F else f"\\x{i:02x}"
    if ret in '\\"':
        ret = "\\" + ret
    return ret


def convert(message):
    return "".join([escape(i) for i in message])


# convert a flow into pwn script
def flow2pwn(flow: FlowDetail):
    script = """import json
import sys

from pwn import *

HOST = os.getenv('TARGET_IP')
EXTRA = json.loads(os.getenv('TARGET_EXTRA', '[]'))

proc = remote(HOST, {})
""".format(
        flow.port_dst
    )

    for item in flow.kind_items():
        if item.direction == "c":
            script += """proc.write(b"{}")\n""".format(convert(item.data))

        else:
            script += """proc.recvuntil(b"{}")\n""".format(
                convert(item.data[-10:]).replace("\n", "\\n")
            )

    return script
#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This file is part of Flower.
#
# Copyright ©2018 Nicolò Mazzucato
# Copyright ©2018 Antonio Groza
# Copyright ©2018 Brunello Simone
# Copyright ©2018 Alessio Marotta
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
#
# Flower is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Flower is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Flower.  If not, see <https://www.gnu.org/licenses/>.

import base64

from database import FlowDetail


def escape(i):
    if isinstance(i, str):
        i = ord(i)
    ret = chr(i) if 0x20 <= i and i < 0x7F else f"\\x{i:02x}"
    if ret in '\\"':
        ret = "\\" + ret
    return ret


def convert(message):
    return "".join([escape(i) for i in message])


# convert a flow into pwn script
def flow2pwn(flow: FlowDetail):
    script = """import json
import sys

from exploitfarm import *
from requests import *
from pwn import *

HOST = get_host()
URL = "http://" + HOST + "/"
TEAMID = HOST.split(".")[2]

FLAGIDS_HOST = "http://10.10.0.1:8081/flagIds"
res = requests.get(FLAGIDS_HOST)
rounds = res.json()["CHANGE_SERVICE"][f"{TEAMID}"]

user = list(rounds.values())[-1]
#username = user["username"]
#flight_id = user["flight_id"]

r = remote(HOST, {})
""".format(
        flow.port_dst
    )

    for item in flow.kind_items():
        if item.direction == "c":
            script += """r.write(b"{}")\n""".format(convert(item.data))

        else:
            script += """r.recvuntil(b"{}")\n""".format(
                convert(item.data[-10:]).replace("\n", "\\n")
            )

    return script
