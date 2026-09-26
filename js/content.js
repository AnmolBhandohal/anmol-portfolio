/* ═══════════════════════════════════════════════════════════
   content.js — SINGLE SOURCE OF TRUTH for this site.
   Upstream truth: C:/Users/Anmol/career/experience.json

   INTEGRITY RULE: every number on this site must exist in
   experience.json as verified. Unbuilt work says so and quotes
   DESIGN TARGETS, labelled as targets — never measured results.
   `python build.py check` scans for the old unverified claims.

   ch: 1 = field work (yellow trace), 2 = projects (cyan trace)
   TO ADD A PROJECT: `python build.py new`, or copy a block.
   ═══════════════════════════════════════════════════════════ */

const SITE = {
  name:    'Anmol Bhandohal',
  role:    'Electrical Engineering · Co-op',
  location:'Edmonton, Alberta',
  email:   'bhandoha@ualberta.ca',
  github:  'https://github.com/AnmolBhandohal',
  linkedin:'https://www.linkedin.com/in/anmol-bhandohal-904789305/',
  resume:  'resume.pdf',
  url:     'https://anmolbhandohal.com',
  available:'Jan – Aug 2027',
  availableLong:'January – August 2027 · one 8-month term or two 4-month terms',
  rev:     '2.0',
  updated: '2026-09'
};

const PROJECTS = [
/* ─────────────────────────────────────────────── FIELD */
{
  id:'field', n:'01', ch:1, feature:'recall',
  title:'Electrical Apprentice',
  short:'Field record · Powerworks',
  status:'Summer 2026', live:false,
  label:'FIELD RECORD / SUMMER 2026',
  year:'Summer 2026',
  role:'Powerworks · commercial & residential',

  problem:'A $9.6M three-storey commercial building needed its addressable fire alarm programmed — including the logic that tells the elevators what to do when it goes off.',
  approach:'Programmed a Mircom FX-3500: pull stations, smoke and heat detectors, and the relay outputs that drive Phase I elevator recall.',
  result:'Walked the finished building with the consulting engineer for verification and acceptance, and cleared deficiencies before sign-off.',
  metric:{ value:'7', unit:'sites', label:'Completed in one term' },

  body:`A summer on construction sites: 347&nbsp;V and 120/208&nbsp;V services, conduit and feeders,
        and an addressable fire alarm system on a <strong>$9.6M three-storey commercial build</strong>
        — plus a ground fault I tracked down by halving the circuit.`,

  specs:[['Sites','7 · 3 commercial, 4 residential'],['Services','<b>347 V</b> · 120/208 V'],
         ['Fire alarm','Mircom FX-3500 · addressable'],['Acceptance','Verification walk · CAN/ULC-S537']],
  tags:['CEC','Fire alarm','Relay logic','Three-phase','Blueprints','Fault finding'],
  stack:['Canadian Electrical Code','Mircom FX-3500','Multimeter','Single-line diagrams','Conduit','BX / TECK'],
  photo:null, repo:null,

  study:[
    { h:'What the summer actually was',
      p:`Seven sites in one term: a retail plaza, a daycare, 15-unit townhouse duplexes, 6-plexes,
         single-family homes, a hockey arena power upgrade, and temporary generator distribution that
         kept a commercial site energized through construction.<br><br>
         The daily work was the part nobody puts on a portfolio: installing and terminating
         <strong>347&nbsp;V and 120/208&nbsp;V services</strong>, disconnects and multi-meter stacks;
         bending and running conduit; pulling feeders with fish tape and a vacuum; strapping BX and
         TECK; and installing lighting, HRV and heater fans, receptacles and low-voltage data to the
         Canadian Electrical Code.` },

    { h:'Elevator recall is a truth table', lab:'recall',
      p:`The most interesting job was the fire alarm on the <strong>Caishen at Windermere</strong>
         building — a Mircom FX-3500 addressable panel. Beyond the pull stations and detectors, the
         panel has to tell the elevator controller what to do in an alarm.<br><br>
         The rule is simple to say: on any alarm, send the car to the designated recall floor and
         hold it there with the doors open. Unless the alarm started <em>on</em> the recall floor —
         then send it to the alternate, because you don't deliver people to the fire.
         Written out, it's a truth table: inputs are the alarm points, outputs are relays.`,
      code:`// Phase I recall, written as logic. (The panel is configured,
// not coded — this is the behaviour the relay mapping produces.)
if (alarm.any) {
  const floor = alarm.at(MAIN) ? ALTERNATE : MAIN;
  relay.recall(floor);       // car returns, no stops
  relay.hold(DOORS_OPEN);    // and stays there for fire crews
}` },

    { h:'Finding a ground fault by halving the circuit', lab:'fault',
      p:`An intermittent ground fault showed up on a live fire alarm circuit. Checking every device
         one by one is slow, and "intermittent" means it might not show up on the device you
         happen to be checking.<br><br>
         So I split the problem instead. The panel's terminal blocks are pluggable: pull one and
         you've cut the circuit in half. Ohm out each half, keep the one with the fault, and split
         again. That's a binary search — a circuit with 16 segments needs about
         <strong>4 checks instead of up to 16</strong>.<br><br>
         It localized the faulted segment and restored service <strong>without pulling new
         cable</strong>.` },

    { h:'Reading the prints, running the order',
      p:`Commercial jobs run on drawings: single-line diagrams, panel schedules, and device layouts
         spread across three levels. I worked from those to set the install sequence and circuit
         routing for the crew.<br><br>
         A drawing is a promise the building has to keep. Learning to read one well — and to spot
         where it can't physically be built as drawn — turned out to be the most transferable skill
         of the summer.` },

    { h:'Verification & acceptance',
      p:`At the end, I walked the completed building with the consulting engineer for verification
         and acceptance: confirming each device operated as designed, and clearing deficiencies
         before sign-off.<br><br>
         It's the same idea as a design review, except the design is made of drywall and conduit and
         can't be recompiled.` },

    { h:'What it changed',
      p:`I came back to school thinking differently about my own boards. A connector that's easy to
         crimp can be impossible to reach in the finished install. A fault that only appears live
         won't show up on the bench. It's why my ARVP work leans on keyed connectors, and why
         I size a logger's buffer for the whole test, not the demo.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="currentColor" stroke-width="1.5">
      <path class="draw" d="M40 44v214M360 44v214"/>
      <path class="draw" d="M40 100h72M128 100h52M196 100h74M310 100h50"/>
      <path class="draw" d="M112 88v24M128 88v24M180 88v24M196 88v24M178 114l20-28"/>
      <path class="draw" d="M276 88a16 16 0 0 0 0 24M304 88a16 16 0 0 1 0 24"/>
      <path class="draw" d="M40 168h72M128 168h142M310 168h50"/>
      <path class="draw" d="M112 156v24M128 156v24"/>
      <path class="draw" d="M276 156a16 16 0 0 0 0 24M304 156a16 16 0 0 1 0 24"/>
      <path class="draw" d="M40 232h72M128 232h142M310 232h50"/>
      <path class="draw" d="M112 220v24M128 220v24"/>
      <path class="draw" d="M276 220a16 16 0 0 0 0 24M304 220a16 16 0 0 1 0 24"/>
    </g>
    <g fill="currentColor" font-family="JetBrains Mono" font-size="8.5" opacity=".85">
      <text x="34" y="36">L1</text><text x="354" y="36">L2</text>
      <text x="96" y="80">ALARM</text><text x="166" y="80">@MAIN</text><text x="258" y="80">RECALL MAIN</text>
      <text x="96" y="148">@MAIN</text><text x="258" y="148">RECALL ALT</text>
      <text x="96" y="212">ALARM</text><text x="252" y="212">HOLD · DOORS</text>
    </g>
    <text x="40" y="284" fill="#5C6878" font-family="JetBrains Mono" font-size="8">PHASE I RECALL — LADDER VIEW</text>
  </svg>`
},

/* ─────────────────────────────────────────────── ARVP */
{
  id:'arvp-auv', n:'02', ch:2, gallery:'ARVP_GALLERY',
  title:'ARVP — Autonomous Underwater Vehicle',
  short:'ARVP underwater vehicle',
  status:'Active', live:true,
  label:'SUBSEA / COMMS HUB REV C',
  year:'Sept 2025 — present',
  role:'Electrical subsystem',

  problem:'Once the hull is sealed and the vehicle is in the water, no connector can be reached, reseated, or reworked.',
  approach:'Took failure modes out on the bench: keyed connectors that can\'t be plugged in backwards, CAN for the vehicle bus, and a 4-layer board checked against the manufacturer\'s rules.',
  result:'4-layer stackup cleared a full design-rule check with <b>zero violations</b> before sign-off.',
  metric:{ value:'4', unit:'layers', label:'Stackup · DRC clean' },

  body:`Electrical subsystem work on the University of Alberta's autonomous sub — including a
        Teensy 4.0 board I designed end to end in Altium, schematic to layout. When the hull is sealed
        there's no reaching back in, so the work is making the wrong thing <strong>physically
        impossible</strong> before it ever gets wet.`,

  specs:[['Onboarding board','Teensy 4.0 carrier · <b>designed &amp; fabricated</b>'],['Comms Hub','Revised in Altium · CAN transceivers'],
         ['Stackup','4-layer · signal / GND / power · DRC clean'],['Filter','Active LPF · 1 kHz vs 15 kHz noise']],
  tags:['Altium','4-layer PCB','CAN bus','LTspice','Integration test'],
  stack:['Altium Designer','LTspice','CAN bus','Op-amp filters','Harness & connectors'],
  photo:'img/arvp-onboard-3d.webp', repo:null,

  study:[
    { h:'A different kind of constraint',
      p:`Most electronics are reachable. Something misbehaves, you probe it, you resolder a joint.
         That assumption is so basic you don't notice you're making it.<br><br>
         An AUV deletes it. Once the hull is sealed, every connection inside is out of reach, and a
         bad one means the vehicle comes out, the hull comes open, and the team loses the run. It
         moves the whole effort <em>earlier</em>: you can't fix it later, so you design it so it
         can't go wrong.` },

    { h:'A board of my own: the onboarding carrier', gallery:'ARVP_GALLERY',
      p:`ARVP's electrical onboarding asks you to take a board all the way from schematic to layout to a
         fabricated PCB. Mine was <strong>fabricated</strong>. It's a
         carrier for a <strong>Teensy 4.0</strong>, and I used it to put one of each thing the vehicle
         actually needs onto a single board — the schematic is dated 28 December 2025.<br><br>
         <strong>CAN.</strong> A TCAN1042 transceiver with a 120&nbsp;Ω termination resistor across
         CANH/CANL. Without termination at each end of the bus, edges reflect and corrupt frames.<br>
         <strong>Temperature over I²C.</strong> A TCN75A sensor, sharing SDA/SCL with the MCU through
         4.02&nbsp;kΩ pull-ups, each IC with its own 100&nbsp;nF decoupling cap.<br>
         <strong>A Hall-effect input.</strong> A DRV5033 switch whose output drives a BSS84 P-channel
         MOSFET and an indicator LED — so you can <em>see</em> the magnet being detected without a
         serial monitor.<br>
         <strong>A buffered analog input.</strong> A 1&nbsp;kΩ / 100&nbsp;nF RC low-pass
         (f<sub>c</sub> = 1/2πRC ≈ <strong>1.6&nbsp;kHz</strong>) ahead of an LMV321 op-amp wired as a
         unity-gain buffer, so the ADC sees a low-impedance source.<br>
         <strong>A payload header</strong> breaking out SPI, UART and I²C, and a keyed Molex power
         input with bulk capacitance.` },

    { h:'Connectors that can\'t go in backwards',
      p:`The Comms Hub board used bare pin headers. A pin header will happily accept a connector
         rotated 180°, and on a power connector that's reverse polarity: best case a blown fuse,
         worst case a dead board inside a sealed hull.<br><br>
         I revised the board in Altium to use <strong>keyed, shrouded connectors</strong>. The key
         makes the wrong orientation physically impossible — no label to read, no care required at
         7&nbsp;a.m. on test day. It's the cheapest reliability upgrade there is.` },

    { h:'Bringing up CAN',
      p:`The same revision activated the board's <strong>CAN bus transceivers</strong> for vehicle
         communications. CAN suits a vehicle like this: it's differential, so noise from thrusters
         and power switching hits both wires equally and cancels, and it's multi-drop, so many
         boards share one bus instead of a star of point-to-point links.` },

    { h:'A 4-layer stackup, checked before fabrication',
      p:`I designed a 4-layer stackup with dedicated signal, ground and power planes. The solid
         ground plane is the point: every signal gets a return path directly beneath it, which keeps
         loop area small and noise down.<br><br>
         I set the manufacturer's clearance constraints as design rules and cleared a full DRC with
         <strong>zero violations</strong> before sign-off. A rule violation found in Altium costs a
         minute; one found on a fabricated board costs a re-spin.` },

    { h:'Pulling 1 kHz out of 15 kHz noise', lab:'filter',
      p:`A sensor signal at 1&nbsp;kHz shared its line with 15&nbsp;kHz noise. The two are
         log<sub>10</sub>(15) ≈ <strong>1.2 decades</strong> apart, and that gap sets how steep a
         low-pass filter has to be to pass one and crush the other.<br><br>
         I designed an active op-amp low-pass filter in LTspice and checked its frequency response
         in simulation before anything was built — so the first physical version started from a
         response I'd already seen.` },

    { h:'In the water',
      p:`I supported in-water testing of the vehicle, diagnosing and resolving hardware faults on
         site as they came up. Poolside debugging has one rule: find it fast, because the pool time
         is booked and the whole team is waiting.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="currentColor" stroke-width="1.5">
      <path class="draw" d="M70 150c0-30 34-48 78-48h116c44 0 78 18 78 48s-34 48-78 48H148c-44 0-78-18-78-48z"/>
      <path class="draw" d="M70 150H30"/><rect class="draw" x="126" y="130" width="54" height="40" rx="2"/>
      <circle class="draw" cx="232" cy="150" r="15"/><circle class="draw" cx="232" cy="150" r="5"/>
      <path class="draw" d="M286 126v48M304 126v48"/><path class="draw" d="M342 134v32h26"/>
      <path class="draw" d="M180 150h37" stroke-dasharray="3 3"/>
    </g>
    <g stroke="#5C6878" stroke-width="1"><path class="draw" d="M20 60h360M20 250h360" stroke-dasharray="6 6"/></g>
    <g fill="currentColor" opacity=".8" font-family="JetBrains Mono" font-size="8.5">
      <text x="130" y="154">COMMS HUB</text><text x="270" y="214">THRUSTERS</text>
      <text x="126" y="96">PRESSURE HULL</text><text x="188" y="144">CAN</text></g>
    <text x="20" y="52" fill="#5C6878" font-family="JetBrains Mono" font-size="8">WATERLINE</text>
  </svg>`
},


/* ─────────────────────────────────────────────── STM32 */
{
  id:'stm32', n:'03', ch:2, explore:'STM32_SCH', wide:true, gallery2:'STM32_GALLERY',
  title:'STM32F411 IMU Board',
  short:'STM32 sensor board',
  status:'Self-directed · design', live:false,
  label:'MCU-IMU / PCB2',
  year:'Dec 2025',
  role:'Self-directed · schematic & 4-layer layout',

  problem:'I wanted to learn the STM32, and plugging in a dev board would have hidden the parts worth learning. So this puts a bare STM32 on the PCB — power, clock, reset and debug are all mine to get right.',
  approach:'USB power through a ferrite bead and a 3.3 V LDO, an STM32F411 with its crystal, straps and SWD, and an MPU-6050 IMU on I²C — laid out on a 4-layer board with two ground planes.',
  result:'A <b>36-part</b>, 4-layer design in Altium: signal / GND / GND / signal.',
  metric:{ value:'36', unit:'parts', label:'4 layers · SIG/GND/GND/SIG' },

  body:`A bare-silicon microcontroller board: an <strong>STM32F411</strong>, its own USB power stage,
        a 24&nbsp;MHz clock, reset and boot straps, SWD debug, and an <strong>MPU-6050</strong>
        motion sensor — on four layers with two solid ground planes. Hover the schematic to take it
        apart block by block.`,

  specs:[['MCU','STM32F411CEU6 · Cortex-M4'],['Sensor','MPU-6050 IMU · I²C 0x68'],
         ['Power','USB → FB → AMS1117-3.3'],['Stackup','<b>4 layers</b> · SIG / GND / GND / SIG']],
  tags:['Altium','STM32','4-layer','I²C','USB','SWD'],
  stack:['Altium Designer','STM32F411','MPU-6050','AMS1117','SWD','4-layer stackup'],
  photo:null, repo:null,

  study:[
    { h:'No dev board this time',
      p:`The Teensy and ESP32 boards elsewhere on this page are <em>carriers</em> — a finished dev board
         plugs into them and brings its own regulator, crystal, reset circuit and USB. That's the right
         call for getting sensors working, but it means the most instructive parts of a microcontroller
         design were somebody else's.<br><br>
         I designed this one on my own to learn the STM32 family properly: the bare
         <strong>STM32F411CEU6</strong> goes on the PCB, so every one of those is on me. It's a design
         exercise — it hasn't been fabricated.` },

    { h:'The schematic, block by block', explore:'STM32_SCH',
      p:`Three functional blocks on one sheet. Hover one — or tap it on a phone — to zoom in.` },

    { h:'Power: USB to 3.3 V',
      p:`VBUS from the micro-USB passes through a <strong>120&nbsp;Ω ferrite bead</strong> before the
         regulator. At DC the bead is almost a wire; at high frequency it's lossy, so switching noise
         from whatever is on the other end of the cable is soaked up before it reaches the rail.<br><br>
         An <strong>AMS1117-3.3</strong> linear regulator then drops 5&nbsp;V to 3.3&nbsp;V. A linear
         regulator burns the difference as heat, so it's worth a sanity check: at an assumed
         100&nbsp;mA load, (5 − 3.3)&nbsp;V × 0.1&nbsp;A ≈ <strong>0.17&nbsp;W</strong> — comfortable for its package.
         Bulk and ceramic capacitance sit on both sides, with a power LED so you can see the rail is up.` },

    { h:'Clock, reset, boot, debug',
      p:`The four things a dev board quietly does for you:<br><br>
         <strong>Clock.</strong> A 24&nbsp;MHz crystal with two 10&nbsp;pF load capacitors. They appear in
         series across the crystal — 10 × 10 / (10 + 10) = 5&nbsp;pF — plus a few pF of board stray,
         and that total has to match the crystal's rated load or it runs slightly off frequency.<br>
         <strong>Reset.</strong> NRST has a 10&nbsp;kΩ pull-up and 100&nbsp;nF to ground, so it comes out
         of reset cleanly at power-up.<br>
         <strong>Boot.</strong> BOOT0 is pulled low through 10&nbsp;kΩ, so the chip runs from flash
         rather than dropping into the bootloader.<br>
         <strong>Debug.</strong> SWDIO, SWCLK, SWO and NRST go to a header (J2, marked do-not-populate)
         for a programmer.<br><br>
         Every supply pin gets its own 100&nbsp;nF, plus 2.2&nbsp;µF of bulk.` },

    { h:'A motion sensor on I²C',
      p:`The <strong>MPU-6050</strong> is a 6-axis accelerometer and gyroscope. It sits on the STM32's
         I²C1 pins (PB6/PB7) with 2.2&nbsp;kΩ pull-ups, and AD0 is tied low, which fixes its address at
         <strong>0x68</strong>. Its interrupt line goes to PB8 so firmware can react when new data is
         ready instead of polling.<br><br>
         The three odd-looking capacitors — CPOUT 2.2&nbsp;nF, REGOUT 100&nbsp;nF, VLOGIC 10&nbsp;nF —
         are the ones the datasheet calls for to feed the part's internal charge pump and regulator.` },

    { h:'Four layers, two grounds', gallery:'STM32_GALLERY',
      p:`The stackup in the board file is <strong>signal / GND / GND / signal</strong>. Two inner ground
         planes mean every trace on either outer layer has an unbroken return path directly beneath it —
         the current comes back right under the signal, loop area stays small, and noise stays down.
         In the board file, nearly all routing is on the top layer, which leaves the planes beneath it
         unbroken.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none"><g stroke="currentColor" stroke-width="1.5">
    <rect class="draw" x="150" y="100" width="100" height="100"/><rect class="draw" x="40" y="40" width="60" height="60"/>
    <path class="draw" d="M100 70h50v40M250 150h110M200 200v60"/></g></svg>`
},

/* ─────────────────────────────────────────────── ESP32 */
{
  id:'env-monitor', n:'04', ch:2, feature:'ring',
  title:'ESP32 Environmental Monitor',
  short:'Environmental monitor',
  status:'Built', live:false,
  label:'IOT-LOGGER / REV A',
  year:'Fall 2025',
  role:'Firmware, hardware, dashboard',

  problem:'One sensor reading tells you almost nothing. Comparing two rooms fairly takes hours of data captured the same way, labelled so you can tell the runs apart.',
  approach:'Four sensors on one I²C bus, a rolling buffer sized for a full six-hour capture, and a dashboard that tags each run by room.',
  result:'A <b>720-point</b> rolling buffer — one sample every 30 s for 6 h — served live as JSON and exported as CSV.',
  metric:{ value:'720', unit:'points', label:'Buffer = one 6 h capture' },

  body:`A logger built for comparing rooms, not for taking one reading. Temperature, humidity,
        pressure and light on a shared I²C bus, with every capture run <strong>tagged and reset
        from the dashboard</strong> so two rooms are compared on equal terms.`,

  specs:[['Sensing','Temp · RH · pressure · light — I²C'],['Buffer','<b>720 points</b> · 6 h rolling'],
         ['Interface','Live dashboard · REST / JSON · CSV'],['Sessions','/setroom tags each run']],
  tags:['ESP32','C++','I²C','REST API','JSON'],
  stack:['ESP32','C++','I²C','HTTP server','REST / JSON','CSV export'],
  photo:null, repo:null,

  study:[
    { h:'A logger, not a reading',
      p:`The tutorial version of this project reads a sensor and prints a number. That answers
         nothing. The question I wanted to answer was comparative — <em>is this room behaving
         differently from that one?</em> — and a comparison is only fair if both sides were measured
         the same way, for the same length of time.<br><br>
         So the design target was a <strong>six-hour capture</strong>, run identically in each room.` },

    { h:'Sizing the buffer from the question', lab:'ring',
      p:`Six hours at one sample every 30 seconds is 6 × 3600 / 30 = <strong>720 samples</strong>.
         That's the buffer: a fixed 720-point ring. When it's full, the newest sample overwrites the
         oldest, so memory use is constant no matter how long the device runs — there's no
         "eventually runs out of heap."`,
      code:`// fixed-size ring buffer — the idea, simplified
constexpr size_t N = 720;          // 6 h × 3600 s / 30 s
Sample buf[N];
size_t head = 0, count = 0;

void push(const Sample& s) {
  buf[head] = s;
  head = (head + 1) % N;          // wrap: overwrite the oldest
  if (count < N) count++;
}` },

    { h:'Four sensors, one bus',
      p:`Temperature, humidity, pressure and ambient light all sit on a single I²C bus — two wires,
         each sensor at its own address. It keeps the wiring trivial and leaves the rest of the
         ESP32's pins free.` },

    { h:'Labelled sessions',
      p:`The part that makes the data usable is the <code>/setroom</code> endpoint. It tags the
         current capture with a room name and resets the buffer, so each run starts clean and is
         labelled at the source — instead of being reconstructed from memory and timestamps
         afterwards.<br><br>
         The ESP32 also runs an HTTP server: a live, auto-refreshing dashboard, REST endpoints
         serving the current readings as JSON, and a CSV export for analysis offline.` },

    { h:'What\'s next',
      p:`The firmware and hardware are built. <strong>The multi-room trial itself hasn't been run
         yet</strong> — when it has, the plots go on this page. Until then, this page describes the
         instrument, not a result.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="currentColor" stroke-width="1.5">
      <rect class="draw" x="34" y="110" width="86" height="76" rx="2"/>
      <path class="draw" d="M120 124h40M120 142h40M120 160h40M120 178h40"/>
      <rect class="draw" x="160" y="116" width="34" height="16"/><rect class="draw" x="160" y="134" width="34" height="16"/>
      <rect class="draw" x="160" y="152" width="34" height="16"/><rect class="draw" x="160" y="170" width="34" height="16"/>
      <rect class="draw" x="240" y="104" width="120" height="88" rx="2"/>
      <path class="draw" d="M252 172l22-26 20 16 22-34 20 22"/>
      <path class="draw" d="M77 110V84M64 92c8-9 18-9 26 0M54 80c14-15 32-15 46 0"/>
      <path class="draw" d="M104 92h136v12" stroke-dasharray="3 4"/>
    </g>
    <g fill="currentColor" opacity=".8" font-family="JetBrains Mono" font-size="8">
      <text x="50" y="152">ESP32</text><text x="165" y="127">T</text><text x="164" y="145">RH</text>
      <text x="164" y="163">hPa</text><text x="164" y="181">lx</text><text x="250" y="124">/setroom · JSON</text></g>
    <text x="34" y="228" fill="#5C6878" font-family="JetBrains Mono" font-size="8">I²C BUS · 720-POINT RING · 6 H</text>
  </svg>`
},

/* ─────────────────────────────────────────────── LAMP */
{
  id:'led-lamp', n:'05', ch:2, featureFig:'LAMP_PCB',
  title:'Adaptive Closed-Loop LED Lamp',
  short:'Adaptive LED lamp',
  status:'In development', live:true,
  label:'CTRL-LOOP / REV A',
  year:'2026 — in development',
  role:'Schematic, PCB, firmware',

  problem:'Normal dimmable lamps set their output, not how bright the desk actually is — so the brightness drifts whenever the room changes.',
  approach:'Measure the light at the desk and close the loop: an ESP32 reads a light sensor and PWM-drives a 12 V strip through a low-side MOSFET.',
  result:'Breadboard proven; 2-layer PCB in layout. Target: <b>5 kHz</b> PWM — above visible flicker, below meaningful switching loss. Step-response numbers go here once they\'re measured.',
  metric:{ value:'5', unit:'kHz', label:'PWM design target' },

  body:`A lamp that holds <em>brightness at the desk</em> instead of its own output. The control
        loop is the easy half — the interesting decisions are the PWM frequency and a gate network
        that fails <strong>safe</strong>. The hero at the top of this page simulates its gate drive.`,

  specs:[['Drive','RJK1003DPP low-side · 12 V strip'],['Target','<b>5 kHz</b> PWM (design)'],
         ['Board','2-layer · Altium · full GND plane'],['Status','Breadboard → PCB layout']],
  tags:['Altium','PWM','MOSFET','Control','ESP32','15-part BOM'],
  stack:['Altium Designer','ESP32','C++','PWM','MOSFET switching','I²C'],
  photo:null, repo:null,

  study:[
    { h:'Why this exists',
      p:`Every "dimmable" lamp is <em>open-loop</em>: you set a brightness and it holds that
         <em>output</em>, not that <em>result</em>. Open the blinds and the desk gets washed out;
         a cloud passes and everything dims. Nothing is measuring the thing you actually care about.
         <br><br>
         That's a control problem with a known shape: measure the result, compare it to what you
         want, correct the difference. So that's what this is.` },

    { h:'Switch, don\'t throttle',
      p:`The obvious way to dim an LED is to run the transistor half-on, as a variable resistor.
         But then it has current through it <em>and</em> voltage across it at the same time, and
         power is I × V — it turns into a heater.<br><br>
         Switching avoids that. The MOSFET is only ever fully on (almost no voltage across it) or
         fully off (no current through it), so it stays cool. Brightness comes from the
         <em>fraction of time</em> it's on — the duty cycle. Your eye averages it.<br><br>
         Perception isn't linear, though: 50% duty looks far brighter than "half". The firmware
         plan applies gamma correction so the dimming feels even.`,
      code:`// LEDC hardware PWM — 5 kHz target, 12-bit
ledcSetup(CH, 5000, 12);
ledcAttachPin(GATE_PIN, CH);

// perceived brightness isn't linear — gamma-correct
uint16_t duty = pow(level / 4095.0, 2.2) * 4095;
ledcWrite(CH, duty);` },

    { h:'Why 5 kHz',
      p:`Below roughly 200&nbsp;Hz, flicker is visible, especially in peripheral vision. Around
         1&nbsp;kHz it disappears, but ceramic capacitors and magnetics can start to whine audibly.
         Higher still fixes both — but every switching edge passes through a lossy moment where the
         MOSFET is partly on, and more edges per second means more loss.<br><br>
         5&nbsp;kHz sits in the gap: a 200&nbsp;µs period, invisible, above the whine, with switching
         loss that stays small. It's the design target; the scope capture will confirm it.` },

    { h:'Two resistors that fail safe', fig:'LAMP_SCHEMATIC', figcap:'Power stage, redrawn from the Altium sheet. Values and part numbers are the ones on the schematic.',
      p:`<strong>R1, 100&nbsp;Ω in series with the gate.</strong> A MOSFET gate is a capacitor.
         Driving one straight from a pin means a current spike limited only by parasitics. R1 caps it
         at 3.3&nbsp;V / 100&nbsp;Ω = 33&nbsp;mA and damps ringing.<br><br>
         <strong>R2, 100&nbsp;kΩ from gate to ground.</strong> A gate holds charge. During boot, reset
         or reflash, the ESP32 pin floats — and without R2 the gate keeps whatever charge it had, so
         the LED does something undefined. R2 bleeds it off, so <em>undefined means off</em>.` },

    { h:'The board, as it stands', fig:'LAMP_PCB', figcap:'Placement from PCB3.PcbDoc, rendered from the file itself. Parts are placed; routing is next. C2, R3 and R4 are still parked off-board.', bom:true,
      p:`Fifteen parts on a 2-layer carrier that the ESP32 dev board plugs into. The bill of materials
         below is pulled straight from the schematic — including the MOSFET that review flagged.` },

    { h:'What review caught before a board was ordered',
      p:`A schematic review before fabrication flagged real problems — which is exactly when you
         want to find them:<br><br>
         <strong>MOSFET pinout.</strong> Depending on the package, drain and source can be swapped.
         Backwards, the body diode conducts and the LED sits permanently on with the gate doing
         nothing. Check the datasheet pinout, not the symbol.<br>
         <strong>Logic-level gate.</strong> A 3.3&nbsp;V gate needs a part rated at that
         V<sub>GS</sub>; a standard MOSFET barely turns on and cooks.<br>
         <strong>No 3.3&nbsp;V source on board.</strong> Logic was back-fed from the dev board's
         regulator, so the lamp needed USB <em>and</em> the barrel jack. Rev B adds a 12→5&nbsp;V buck.<br>
         <strong>SDA/SCL swapped</strong> against the ESP32 default — a one-line software fix, but
         swapped back in the schematic so no future library trips on it.` },

    { h:'The feedback trap (designing for it now)', lab:'loop',
      p:`The lamp lights the sensor that controls the lamp, so every correction changes the very
         reading it's correcting. Set the gain too high and the loop hunts — the light visibly pulses
         around the setpoint.<br><br>
         The plan: run the loop at 10–20&nbsp;Hz rather than per PWM cycle (the room doesn't change
         in microseconds), start with conservative gains, and position the sensor to see ambient
         light more than the lamp's own output — reducing the loop gain in hardware instead of
         fighting it in software. The step-response test will show whether that was enough.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="currentColor" stroke-width="1.5">
      <path class="draw" d="M30 150h58"/><circle class="draw" cx="100" cy="150" r="12"/>
      <path class="draw" d="M112 150h50"/><rect class="draw" x="162" y="130" width="70" height="40" rx="2"/>
      <path class="draw" d="M232 150h48"/><rect class="draw" x="280" y="132" width="46" height="36" rx="2"/>
      <path class="draw" d="M326 150h34v92H188v-4" stroke-dasharray="4 4"/>
      <rect class="draw" x="112" y="222" width="76" height="38" rx="2"/>
      <path class="draw" d="M112 241H100v-79" stroke-dasharray="4 4"/>
      <path class="draw" d="M162 90h10v-20h14v20h10v-20h14v20h10v-20h14v20h10"/>
    </g>
    <g fill="currentColor" opacity=".8" font-family="JetBrains Mono" font-size="8.5">
      <text x="26" y="140">SETPOINT</text><text x="172" y="154">PWM 5kHz</text>
      <text x="290" y="154">LED</text><text x="122" y="245">SENSOR</text>
      <text x="236" y="272">FEEDBACK</text><text x="180" y="60">V_GS</text></g>
    <text x="96" y="172" fill="currentColor" font-family="JetBrains Mono" font-size="10">−</text>
    <text x="30" y="284" fill="#5C6878" font-family="JetBrains Mono" font-size="8">DESIGN — NOT YET MEASURED</text>
  </svg>`
},

/* ─────────────────────────────────────────────── MOMENTUM */
{
  id:'momentum', n:'06', ch:2,
  title:'Momentum — a focus app',
  short:'Momentum',
  status:'Active', live:true,
  label:'REACT-APP / REV D',
  year:'2026',
  role:'Design and build',

  problem:'Pomodoro timers interrupt you every 25 minutes. For an ADHD brain mid-hyperfocus, the interruption is the failure mode, not the feature.',
  approach:'Inverted the incentive: score streaks for finishing self-defined blocks instead of enforcing fixed breaks.',
  result:'A React app that rewards finishing what you started — with <b>no forced breaks</b>.',
  metric:null,

  body:`Pomodoro timers don't survive contact with an ADHD brain. Getting pulled out of deep focus
        every 25 minutes is <strong>the failure mode, not the feature</strong>.`,

  specs:[['Stack','React · local storage'],['Core','Session modes · per-block timers'],
         ['System','<b>Streak scoring</b>'],['Origin','Built for my own use']],
  tags:['React','JavaScript','UI design','Product thinking'],
  stack:['React','JavaScript','CSS','Local storage'],
  photo:null, repo:null,

  study:[
    { h:'Built for a specific brain',
      p:`The Pomodoro technique assumes focus is scarce and needs rationing: 25 minutes on, 5 off,
         repeat. That works for a lot of people.<br><br>
         It's wrong for mine. Getting into deep focus takes a while and isn't fully under my control.
         When it arrives, an alarm telling me to stop destroys the thing I was trying to produce. The
         timer is optimizing the wrong variable.` },

    { h:'Inverting the incentive',
      p:`So Momentum doesn't enforce breaks. It scores <em>streaks</em> — consecutive completed
         blocks, where you set the block length yourself.<br><br>
         A Pomodoro timer rewards <em>obeying the clock</em>. Momentum rewards <em>finishing what you
         started</em>. Only one of those survives contact with hyperfocus.` },

    { h:'Why it\'s on an engineering portfolio',
      p:`Because the interesting part was diagnosis, not implementation. React and a timer aren't
         hard. Working out <em>why</em> every existing app failed me — that the fault was the
         incentive model, not the interface — is the same skill as debugging hardware: the visible
         symptom is rarely the actual fault.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#5C6878" stroke-width="1.2">
      <path class="draw" d="M40 120h40v-40h40v40h40v-40h40v40h40v-40h40v40h40"/></g>
    <g stroke="currentColor" stroke-width="1.8">
      <path class="draw" d="M40 220h30v-60h260v60h30"/></g>
    <g fill="currentColor" font-family="JetBrains Mono" font-size="8.5" opacity=".85">
      <text x="40" y="66" fill="#5C6878">POMODORO — CHOPPED</text>
      <text x="40" y="150">MOMENTUM — ONE BLOCK, UNBROKEN</text>
      <circle cx="130" cy="160" r="3"/><circle cx="200" cy="160" r="3"/><circle cx="270" cy="160" r="3"/></g>
    <text x="40" y="256" fill="#5C6878" font-family="JetBrains Mono" font-size="8">● STREAK POINTS · SAME TIME AXIS</text>
  </svg>`
}
];



/* ── STM32 board — Anmol's Altium screenshots (Sheet2.SchDoc / PCB2.PcbDoc) ── */
var STM32_SCH = {
  title:'Sheet2.SchDoc — “Altium STM32”. Three blocks: USB power, the STM32F411 with clock / reset / debug, and an MPU-6050 IMU.',
  full:'img/stm32-sch-full.webp', plate:'#fffcf8',
  board:{ src:'img/stm32-3d.webp', plate:'linear-gradient(#fdfdfd,#dfdfdf)', alt:'Altium 3D render of the finished STM32 board layout.', cap:'The board — PCB2.PcbDoc, Altium 3D view' },
  fullAlt:'Full Altium schematic sheet titled Altium STM32, with three blocks: USB connector and LDO regulator, microcontroller STM32F4, and inertial measurement unit MPU-6050.',
  blocks:[
    { label:'USB power', src:'img/stm32-sch-power.webp', x:0.995, y:4.864, w:55.004, h:32.049, hdW:1898, hdH:707,
      short:'Micro-B USB → ferrite bead → AMS1117 3.3 V LDO',
      alt:'Close-up of the USB connector and LDO regulator block.',
      cap:'<b>USB connector &amp; LDO</b> — Micro-B (Molex 47346-0001) VBUS through a 120 Ω ferrite bead into an AMS1117-3.3. 2.2 µF, 2.2 µF and 22 µF on the input, 22 µF on the output, and a green power LED (D1, 1 kΩ).' },
    { label:'STM32F411', src:'img/stm32-sch-mcu.webp', x:7.96, y:41.342, w:55.692, h:54.961, hdW:1585, hdH:1000,
      short:'Cortex-M4 · 24 MHz crystal · SWD · reset & boot straps',
      alt:'Close-up of the STM32F411CEU6 microcontroller block with crystal, decoupling, reset, boot and SWD header.',
      cap:'<b>STM32F411CEU6</b> — 24 MHz crystal with 10 pF load caps; 2.2 µF + five 100 nF across the supply pins; BOOT0 pulled down (10 kΩ) so it boots from flash; NRST with a 10 kΩ pull-up and 100 nF; USB on PA11/PA12; SPI (PA4–PA7) to a 6-pin JST-GH; SWD header J2 (not fitted); user LED on PB13.' },
    { label:'MPU-6050 IMU', src:'img/stm32-sch-imu.webp', x:64.739, y:8.755, w:28.214, h:32.872, hdW:1070, hdH:797,
      short:'6-axis IMU on I²C at 0x68, interrupt to PB8',
      alt:'Close-up of the MPU-6050 inertial measurement unit block.',
      cap:'<b>MPU-6050</b> — 6-axis IMU on I²C1 (PB6/PB7) with 2.2 kΩ pull-ups; AD0 tied low for address 0x68; INT to PB8. CPOUT 2.2 nF, REGOUT 100 nF, VLOGIC 10 nF and VDD 100 nF, as the datasheet specifies.' }
  ]
};
var STM32_GALLERY = [
  { src:'img/stm32-3d.webp', label:'3D', plate:'linear-gradient(#fdfdfd,#dfdfdf)', alt:'Altium 3D render of the STM32 board: STM32 in the centre, MPU-6050 top left, micro-USB on the right, AMS1117 regulator and JST-GH connector along the bottom, four mounting holes.',
    cap:'<b>PCB2.PcbDoc</b> — Altium 3D view. Four layers: signal / GND / GND / signal. USB comes in on the right, the regulator sits below it, the IMU is top-left.' },
  { src:'img/stm32-sch-full.webp', label:'Schematic', plate:'#fffcf8', alt:'Full Altium schematic sheet for the STM32 board.', cap:'The full schematic sheet.' }
];

/* ── ARVP onboarding board — Anmol's own Altium screenshots ── */
var ARVP_GALLERY = [
  { src:'img/arvp-onboard-3d.webp', label:'3D', plate:'linear-gradient(#fefefe,#dedede)', alt:'Altium 3D render of the ARVP electrical onboarding board: a Teensy 4.0 on a carrier with a CAN transceiver, temperature sensor, Hall sensor, analog input and payload header.',
    cap:'<b>Electrical Onboarding · Rev A</b> — fabricated. Altium 3D view. Teensy 4.0 carrier with CAN, I²C temperature, a Hall-effect input, a buffered analog input and a payload header.' },
  { src:'img/arvp-onboard-layout.webp', label:'Layout', plate:'#000', alt:'Top-layer PCB layout in Altium: red top copper, blue bottom copper, footprints for U1 to U5, J1 to J4 and passives.',
    cap:'Top-layer layout. Red is top copper, blue is bottom; the board also carries an internal GND layer. Silkscreen: “Electrical Onboarding Rev A — by Anmol”.' },
  { src:'img/arvp-onboard-schematic.webp', label:'Schematic', plate:'#fffcf8', alt:'Altium schematic titled Phase 1 Teensy 4.0 Schematic, company ARVP, designed by Anmol, revision 1.0, dated 28 December 2025.',
    cap:'Schematic — “Phase 1 Teensy 4.0”, ARVP, rev 1.0, 28 Dec 2025. Seven blocks: power, payload connector, magnetic sensor, MCU, temperature sensor, CAN, analog.' }
];

/* [name, where it was actually used] */
const SKILLS = [
  { g:'Design & EDA', items:[['Altium Designer','ARVP · lamp'],['LTspice','ARVP'],['PCB, 2 & 4 layer','ARVP · STM32'],['Fusion 360',''],['STM32CubeIDE','']] },
  { g:'Firmware & code', items:[['C / C++','ESP32'],['STM32F4','board design'],['Python',''],['MATLAB',''],['VHDL','Zybo Z7'],['Git','']] },
  { g:'Protocols', items:[['I²C','ESP32'],['CAN','ARVP'],['SPI',''],['UART',''],['PWM','lamp']] },
  { g:'Bench', items:[['Oscilloscope',''],['Multimeter','field'],['Soldering, TH & SMD','rework'],['3D printing',''],['Zybo Z7 FPGA','']] },
  { g:'Field & code', items:[['Canadian Electrical Code','field'],['Fire alarm programming','Mircom'],['347 V · 120/208 V','field'],['Conduit & termination','field'],['Blueprint reading','field']] }
];

if (typeof module !== 'undefined') module.exports = { SITE, PROJECTS, SKILLS };
