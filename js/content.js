/* ═══════════════════════════════════════════════════════════
   content.js — SINGLE SOURCE OF TRUTH
   Everything on this site is generated from this file:
   the landing page, every case-study page, the command
   palette, the sitemap, and the OG tags.

   TO ADD A PROJECT: run `python new-project.py` or copy a
   block below. Nothing else needs editing, ever.
   ═══════════════════════════════════════════════════════════ */

const SITE = {
  name:    'Anmol Bhandohal',
  role:    'Electrical Engineering Student',
  location:'Edmonton, Alberta',
  email:   'you@example.com',           // ← CHANGE
  github:  'https://github.com/yourname',// ← CHANGE
  linkedin:'https://linkedin.com/in/yourname', // ← CHANGE
  resume:  '',                           // ← put 'resume.pdf' here once added
  url:     'https://anmolbhandohal.com', // ← your domain when you have it
  tagline: 'I build closed-loop hardware — circuits that measure the world and correct themselves.',
  available:'Open to Summer 2027 co-op'
};

const PROJECTS = [
{
  id:'led-lamp',
  n:'01',
  title:'Adaptive Closed-Loop LED Lamp',
  short:'Adaptive LED Lamp',
  status:'Built & bench-tested',
  live:false,
  label:'CTRL-LOOP / REV B',
  year:'2026',
  role:'Everything — schematic, PCB, firmware',

  /* ── the 7-second layer ── */
  problem:'Every dimmable lamp I owned changed brightness when the room did. Open the blinds, the desk gets washed out. Sun goes behind a cloud, everything dims.',
  approach:'Closed the loop. A photoresistor measures actual light at the work surface, an ESP32 runs a PI controller, and a MOSFET switches the LED at 5&nbsp;kHz.',
  result:'Holds setpoint within <b>±7 lux</b> through full ambient swings. No visible flicker, no audible whine.',
  metric:{ value:'±7', unit:'lux', label:'Setpoint accuracy' },

  body:`A lamp that refuses to change brightness. Photoresistor feedback closes the loop and
        holds the setpoint no matter what the room does — blinds open, cloud passes, overhead
        switched on. The loop was the easy half. The real fight was PWM frequency.`,

  specs:[['Board','Custom 2-layer · Altium'],['Control','PI feedback · <b>±7 lux</b>'],
         ['Drive','5 kHz PWM · logic-level MOSFET'],['MCU','ESP32']],
  tags:['Altium','Analog design','PWM','Control theory','ESP32'],
  stack:['Altium Designer','ESP32','C/C++','PI control','MOSFET switching'],
  photo:null,
  repo:null,

  /* ── the depth layer (case study page) ── */
  study:[
    { h:'Why this exists',
      p:`I have a desk lamp and a window. Those two things fight each other all day. Every
         "dimmable" lamp on the market is <em>open-loop</em> — you set a brightness and it
         holds that <em>output</em>, not that <em>result</em>. Nothing measures whether the
         light landing on your desk actually stayed constant.<br><br>
         That's a control problem, and control problems have a known shape: measure the thing
         you actually care about, compare it to what you want, correct the difference. So I
         built the version that does that.` },

    { h:'The switching decision',
      p:`The obvious way to dim an LED is to vary the current through it. That means running
         the transistor half-on, as a variable resistor — and a resistor with both current
         <em>and</em> voltage across it burns power as heat.<br><br>
         Switching avoids this entirely. The MOSFET is only ever fully on or fully off. When
         it's off there's no current; when it's on there's almost no voltage across it. Power
         is I×V and one of them is always near zero, so the transistor stays cool and the
         efficiency stays high. Brightness comes from the <em>fraction of time</em> it's on,
         not from throttling.`,
      code:`// LEDC hardware PWM — 5 kHz, 12-bit resolution
ledcSetup(CH, 5000, 12);
ledcAttachPin(GATE_PIN, CH);

// perceived brightness is not linear — gamma correct
uint16_t duty = pow(level / 4095.0, 2.2) * 4095;
ledcWrite(CH, duty);` },

    { h:'Why 5 kHz specifically',
      p:`This was the part that actually took iteration.<br><br>
         Below roughly 200&nbsp;Hz the flicker is visible, especially in peripheral vision —
         you catch it when you move your eyes past the lamp. Push up to about 1&nbsp;kHz and
         the flicker disappears, but the ceramic capacitors and the LED strip start to sing:
         a faint whine right in the most annoying part of human hearing.<br><br>
         Going higher solves both, but switching losses scale with frequency. Every transition
         has a moment where the MOSFET is <em>partly</em> on, with both current and voltage
         present — that's the lossy region, and more transitions per second means more time
         spent in it.<br><br>
         5&nbsp;kHz sits in the gap: fast enough to be invisible and inaudible, slow enough
         that switching loss stays negligible.` },

    { h:'The feedback trap',
      p:`Here's the failure mode I didn't anticipate: <strong>the lamp illuminates the sensor
         that controls the lamp.</strong><br><br>
         That's a positive feedback path. Sample too fast or set the gains too high and the
         loop oscillates — the lamp visibly pulses, hunting for a setpoint it keeps
         overshooting. It looks broken because it <em>is</em> broken.<br><br>
         Two fixes. First, slow the loop down deliberately: sample at 10–20&nbsp;Hz, not once
         per PWM cycle. The physical system doesn't change fast, so the controller shouldn't
         either. Second, position the sensor so it sees ambient light preferentially over the
         lamp's own output — reducing the loop gain in hardware rather than fighting it in
         software.` },

    { h:'The gate network',
      p:`Two resistors that look trivial and aren't.<br><br>
         <strong>R1, 100&nbsp;Ω in series with the gate.</strong> A MOSFET gate is a capacitor
         — around 1&nbsp;nF. Driving a capacitor from a voltage source means an instantaneous
         current spike limited only by parasitics. R1 caps that at 33&nbsp;mA, protecting the
         GPIO, and damps the ringing formed by gate capacitance against trace inductance.<br><br>
         <strong>R2, 100&nbsp;kΩ gate to ground.</strong> This one is easy to omit and painful
         to debug. The gate holds charge — it's capacitive and essentially leak-free. When the
         ESP32 pin goes high-impedance during boot, reset, or reflash, the gate keeps whatever
         charge it had and the LED does something undefined. R2 bleeds it to ground so
         <em>undefined means off</em>.` },

    { h:'What I would do differently',
      p:`The board back-feeds 3.3&nbsp;V from the ESP32's onboard regulator, which means it
         needs USB attached to run. For a bench prototype that's fine, but it isn't a product.
         The next revision gets a proper 12&nbsp;V→5&nbsp;V buck converter so the barrel jack
         is the only thing it needs.<br><br>
         I'd also add a series resistor option on the LED output. Right now it assumes a
         12&nbsp;V strip with built-in current limiting — hand it a bare high-power LED and
         the MOSFET will happily let it destroy itself.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#00E5FF" stroke-width="1.5">
      <path class="draw" d="M30 150h58"/><circle class="draw" cx="100" cy="150" r="12"/>
      <path class="draw" d="M112 150h50"/><rect class="draw" x="162" y="130" width="70" height="40" rx="2"/>
      <path class="draw" d="M232 150h48"/><rect class="draw" x="280" y="132" width="46" height="36" rx="2"/>
      <path class="draw" d="M326 150h34v92H150v-42" stroke-dasharray="4 4" opacity=".65"/>
      <rect class="draw" x="112" y="222" width="76" height="38" rx="2" opacity=".8"/>
      <path class="draw" d="M112 241H62v-79" stroke-dasharray="4 4" opacity=".65"/>
    </g>
    <path d="M95 144l5 6-5 6M100 144v12" stroke="#00E5FF" stroke-width="1.2"/>
    <g fill="#00E5FF" opacity=".55" font-family="JetBrains Mono" font-size="8.5">
      <text x="28" y="140">SETPOINT</text><text x="176" y="154">PWM 5kHz</text>
      <text x="292" y="154">LED</text><text x="120" y="245">PHOTO-R</text>
      <text x="252" y="272">FEEDBACK</text></g>
    <g stroke="#7C5CFF" stroke-width="1.2" opacity=".55">
      <path class="draw" d="M40 60c22 0 22-26 44-26s22 26 44 26 22-13 44-13"/></g>
    <text x="40" y="46" fill="#7C5CFF" opacity=".6" font-family="JetBrains Mono" font-size="8">AMBIENT DRIFT</text>
  </svg>`
},
{
  id:'env-monitor',
  n:'02',
  title:'ESP32 Environmental Monitor',
  short:'Environmental Monitor',
  status:'Shipped',
  live:false,
  label:'IOT-TELEMETRY / REV A',
  year:'2025',
  role:'Firmware, hardware, dashboard',

  problem:'Anyone can wire a sensor and print one reading. Almost nothing survives a month on a shelf without a human rescuing it.',
  approach:'Built the boring parts properly: reconnect state machine, watchdog timer, and current-draw budgeting rather than sensor polling.',
  result:'Ran <b>weeks unattended</b> through router reboots and Wi-Fi dropouts with no manual intervention.',
  metric:{ value:'40+', unit:'days', label:'Longest unattended run' },

  body:`Temperature, humidity and air quality streamed to a live dashboard. Anyone can take
        one reading — the project is <strong>the other 40 days</strong>.`,

  specs:[['MCU','ESP32 · C/C++'],['Link','Wi-Fi · auto-reconnect'],
         ['Uptime','<b>Weeks unattended</b>'],['Output','Live web dashboard']],
  tags:['ESP32','C/C++','Wi-Fi','I²C','Embedded'],
  stack:['ESP32','C/C++','I²C','Wi-Fi','Web dashboard'],
  photo:null,
  repo:null,

  study:[
    { h:'The real problem',
      p:`The tutorial version of this project takes an afternoon: wire up a sensor, call
         <code>Wire.read()</code>, print a number. Done.<br><br>
         Then you leave it running and come back in three days to a dead device. The router
         rebooted at 4&nbsp;a.m. and it never reconnected. Or the sensor glitched and the I²C
         bus locked up. Or it just quietly stopped and nothing noticed.<br><br>
         <strong>Getting one reading is the demo. Getting every reading for a month is the
         project.</strong>` },

    { h:'Reconnect as a state machine',
      p:`The naive reconnect is a blocking retry loop. It works until the outage lasts longer
         than the watchdog timeout, then the device resets mid-recovery and you get a boot
         loop.<br><br>
         I rewrote it as a non-blocking state machine with exponential backoff. The main loop
         never blocks, the watchdog stays fed, and reconnect attempts space out instead of
         hammering a router that isn't there yet.`,
      code:`// non-blocking reconnect — never stalls the main loop
if (WiFi.status() != WL_CONNECTED) {
  if (millis() - lastAttempt > backoff) {
    WiFi.reconnect();
    lastAttempt = millis();
    backoff = min(backoff * 2, MAX_BACKOFF);   // 1s → 2s → 4s … 60s
  }
  return;              // fall through, keep feeding the watchdog
}
backoff = 1000;        // reset on success` },

    { h:'What weeks of uptime actually requires',
      p:`Three things, none of them glamorous:<br><br>
         <strong>A hardware watchdog</strong>, fed from the main loop only. If any path hangs,
         the chip resets itself and comes back. Software watchdogs can't save you from a
         locked peripheral.<br><br>
         <strong>Bounded buffers everywhere.</strong> A logger that grows a buffer per reading
         will eventually exhaust heap. On a device meant to run for a month, "eventually" is
         a guarantee, not a risk.<br><br>
         <strong>I²C bus recovery.</strong> A glitched sensor can hold SDA low and wedge the
         bus permanently. Detect it and clock the bus manually to free it.` },

    { h:'What I learned',
      p:`Reliability isn't a feature you add at the end — it's a set of decisions that have to
         be made while you're writing the first version. Every blocking call is a future hang.
         Every unbounded allocation is a future crash.<br><br>
         It changed how I write firmware generally. I now assume the network will fail, the
         sensor will glitch, and the device will run far longer than I tested it for.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#00E5FF" stroke-width="1.5">
      <rect class="draw" x="34" y="110" width="86" height="76" rx="3"/>
      <path class="draw" d="M120 130h44M120 148h44M120 166h44"/>
      <circle class="draw" cx="180" cy="130" r="11"/><circle class="draw" cx="180" cy="148" r="11"/>
      <circle class="draw" cx="180" cy="166" r="11"/><path class="draw" d="M196 148h44"/>
      <rect class="draw" x="240" y="104" width="120" height="88" rx="3"/>
      <path class="draw" d="M252 172l22-26 20 16 22-34 20 22" stroke-width="1.8"/></g>
    <g stroke="#00E5FF" stroke-width="1.3" opacity=".75">
      <path class="draw" d="M77 110V78M64 88c8-9 18-9 26 0M54 76c14-15 32-15 46 0"/></g>
    <g fill="#00E5FF" opacity=".6" font-family="JetBrains Mono" font-size="8.5">
      <text x="46" y="154">ESP32</text><text x="176" y="133">T</text><text x="174" y="151">RH</text>
      <text x="174" y="169">AQ</text><text x="250" y="124">LIVE DASHBOARD</text></g>
    <text x="34" y="228" fill="#7C5CFF" opacity=".6" font-family="JetBrains Mono" font-size="8">RUNS UNATTENDED — WEEKS</text>
    <path class="draw" d="M34 238h326" stroke="#7C5CFF" stroke-width="1" opacity=".3"/>
  </svg>`
},
{
  id:'arvp-auv',
  n:'03',
  title:'ARVP — Autonomous Underwater Vehicle',
  short:'ARVP Underwater Vehicle',
  status:'Active',
  live:true,
  label:'SUBSEA-PWR / REV C',
  year:'2025 — present',
  role:'Electrical subsystems',

  problem:'Once the pressure hull is sealed and the vehicle is in the water, no connection can be reached, inspected, or repaired.',
  approach:'Treated every joint as unrepairable: documented harness, continuity-tested twice, and designed power distribution for graceful failure.',
  result:'Zero in-water electrical failures across the test campaign.',
  metric:{ value:'0', unit:'failures', label:'In-water electrical faults' },

  body:`Electrical subsystem work on UAlberta's autonomous underwater vehicle. Power
        distribution and sensor wiring on a system with <strong>zero tolerance for a bad
        joint</strong>.`,

  specs:[['Scope','Power distribution · sensor harness'],['Team','Multidisciplinary student team'],
         ['Constraint','<b>Sealed — no rework</b>'],['Status','Ongoing']],
  tags:['Power distribution','Harness design','Integration test','Teamwork'],
  stack:['Power distribution','Harness design','Continuity testing','Documentation'],
  photo:null,
  repo:null,

  study:[
    { h:'A different kind of constraint',
      p:`Most electronics you build are reachable. Something misbehaves, you probe it, you
         resolder a joint, you move on. That assumption is so fundamental you don't notice
         you're making it.<br><br>
         An AUV deletes it. The hull gets sealed, the vehicle goes in the water, and every
         connection inside becomes permanently unreachable. A single cold joint means the run
         is scrubbed, the vehicle comes out, the hull is opened, and the team loses the day.` },

    { h:'How that changes the work',
      p:`It moves the entire effort <em>earlier</em>. When rework is free you can be
         iterative — build, test, fix. When rework costs half a day of six people's time, you
         front-load verification instead.<br><br>
         Every joint gets continuity-tested twice: once when made, once after the harness is
         dressed and strain-relieved, because the second test catches what the first can't —
         damage caused by routing. Connectors get chosen for retention, not convenience.
         Everything is labelled at both ends, because "obvious" wiring stops being obvious
         when someone else is holding it at 7&nbsp;a.m. on competition day.` },

    { h:'Working on a real team',
      p:`This is the project here that isn't mine. It's a multidisciplinary student team, and
         the electrical subsystem has to interface with mechanical and software people whose
         constraints I don't fully see.<br><br>
         The thing I actually learned wasn't technical — it was that a design decision I make
         in isolation becomes someone else's problem downstream. A connector I chose because
         it was easy to crimp is a connector someone else has to fit inside a hull I didn't
         design. Asking first is cheaper than discovering later.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#00E5FF" stroke-width="1.5">
      <path class="draw" d="M70 150c0-30 34-48 78-48h116c44 0 78 18 78 48s-34 48-78 48H148c-44 0-78-18-78-48z"/>
      <path class="draw" d="M70 150H30"/><rect class="draw" x="126" y="130" width="54" height="40" rx="3"/>
      <circle class="draw" cx="232" cy="150" r="15"/><circle class="draw" cx="232" cy="150" r="5" fill="#00E5FF"/>
      <path class="draw" d="M286 126v48M304 126v48"/><path class="draw" d="M342 134v32h26"/></g>
    <g stroke="#7C5CFF" stroke-width="1" opacity=".45"><path class="draw" d="M20 60h360M20 250h360"/></g>
    <g fill="#00E5FF" opacity=".6" font-family="JetBrains Mono" font-size="8.5">
      <text x="132" y="154">PWR PCB</text><text x="270" y="196">THRUSTERS</text>
      <text x="126" y="96">PRESSURE HULL</text></g>
    <text x="20" y="52" fill="#7C5CFF" opacity=".55" font-family="JetBrains Mono" font-size="8">WATERLINE</text>
  </svg>`
},
{
  id:'momentum',
  n:'04',
  title:'Momentum — Focus App',
  short:'Momentum',
  status:'Active',
  live:true,
  label:'REACT-APP / REV D',
  year:'2026',
  role:'Design and build',

  problem:'Pomodoro timers interrupt you every 25 minutes. For an ADHD brain, getting pulled out of hyperfocus is the failure mode, not the feature.',
  approach:'Inverted the incentive: score streaks for completing self-defined blocks instead of enforcing fixed breaks.',
  result:'Replaced every timer app I was using. Still my daily driver.',
  metric:{ value:'Daily', unit:'', label:'Still in use' },

  body:`Pomodoro timers don't survive contact with an ADHD brain. Getting interrupted every
        25 minutes mid-flow is <strong>the failure mode, not the feature</strong>.`,

  specs:[['Stack','React'],['Core','Session modes · per-block timers'],
         ['System','<b>Streak scoring</b>'],['Origin','Built for my own use']],
  tags:['React','JavaScript','UI design','Product thinking'],
  stack:['React','JavaScript','CSS','Local storage'],
  photo:null,
  repo:null,

  study:[
    { h:'Built for a specific brain',
      p:`The Pomodoro technique assumes that focus is scarce and needs to be rationed —
         work 25 minutes, break 5, repeat. That's a reasonable model for a lot of people.<br><br>
         It's actively wrong for mine. Getting into deep focus takes me a while and isn't fully
         under my control. When it happens, an alarm telling me to stop is destroying the
         thing I was trying to produce. The timer is optimising for the wrong variable.` },

    { h:'Inverting the incentive',
      p:`So Momentum doesn't enforce breaks. It scores <em>streaks</em> — consecutive completed
         blocks — where you define the block length yourself.<br><br>
         The behavioural difference is the whole point. A Pomodoro timer's reward is
         <em>obeying the clock</em>. Momentum's reward is <em>finishing what you started</em>.
         Those pull in different directions, and only one of them survives contact with
         hyperfocus.` },

    { h:'Why this is on an engineering portfolio',
      p:`Because the interesting part was diagnosis, not implementation. React and a timer are
         not hard. Working out <em>why</em> every existing app failed for me — and that the
         problem was the incentive model rather than the interface — is the part that took
         actual thought.<br><br>
         That's the same skill as debugging hardware: the visible symptom is rarely the
         actual fault. You have to keep asking why until you hit something structural.` }
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#00E5FF" stroke-width="1.5">
      <circle class="draw" cx="112" cy="150" r="56"/>
      <circle class="draw" cx="112" cy="150" r="40" stroke-dasharray="5 6" opacity=".45"/>
      <path class="draw" d="M112 150V104M112 150l30 21"/>
      <path class="draw" d="M204 208h44v-38h40v-58h42v82h40v-56h30" stroke-width="1.8"/></g>
    <g stroke="#7C5CFF" stroke-width="1.2" opacity=".5"><path class="draw" d="M204 232h196"/></g>
    <g fill="#00E5FF" opacity=".6" font-family="JetBrains Mono" font-size="8.5">
      <text x="204" y="98">FOCUS BLOCKS</text><text x="88" y="228">SESSION</text></g>
    <text x="204" y="250" fill="#7C5CFF" opacity=".6" font-family="JetBrains Mono" font-size="8">STREAK SCORED · FLOW UNBROKEN</text>
  </svg>`
}
];

const SKILLS = [
  { g:'Hardware',    items:[['Altium Designer','PCB'],['Schematic capture',''],['Oscilloscope / DMM',''],['Soldering & rework',''],['Three-phase systems','']] },
  { g:'Embedded',    items:[['ESP32','MCU'],['C / C++',''],['PWM & timers',''],['I²C / sensors',''],['Control loops','']] },
  { g:'Software',    items:[['React','UI'],['JavaScript',''],['Python',''],['Git','']] },
  { g:'Fabrication', items:[['Fusion 360','CAD'],['CNC machining',''],['3D printing',''],['DaVinci Resolve','']] }
];

if (typeof module !== 'undefined') module.exports = { SITE, PROJECTS, SKILLS };
