/* ═══════════════════════════════════════════════════════════════════
   exhibits.js — THE ONLY FILE TO EDIT for the site.
   Each section holds projects. To add one, copy a block inside `exhibits`.
   Every claim here must be true and measured (see career/experience.json).
   kind: 'salon' (photo wall) · 'piece' (one large work + label) · 'pair' (two images)
   ═══════════════════════════════════════════════════════════════════ */
const GALLERY = {
  name: 'Anmol Bhandohal',
  line: 'Electrical Engineering (Co-op) · University of Alberta',
  seeking: 'Looking for a co-op term from January 2027: 8 months, or 4 + 4.',
  email: 'bhandoha@ualberta.ca',
  linkedin: 'https://www.linkedin.com/in/anmol-bhandohal-904789305/',
  github: 'https://github.com/AnmolBhandohal',
  resume: 'resume.pdf',
};

/* The entrance wall: one framed piece per project, hung on a common centre line.
   h = relative frame height (1 = tallest). to = the exhibit it jumps to. */
const WALL = [
  { src: 'media/field-roof-row', ar: 1179 / 1494, h: 1, to: 'ex-01', label: 'Field, 2026', g: 1.3 },
  { src: 'media/fig-env_overview', ar: 1600 / 689, h: 1, mat: true, to: 'ex-02', label: 'Cold room', g: 1 },
  { src: 'media/lamp-breadboard', ar: 1600 / 2133, h: 1, to: 'ex-03', label: 'Lamp', g: .8 },
  { src: 'img/arvp-onboard-3d', ar: 959 / 962, h: 1, to: 'ex-04', label: 'ARVP', g: .6 },
  { src: 'img/stm32-3d', ar: 998 / 971, h: 1, to: 'ex-05', label: 'STM32', g: 1.2 },
  { src: 'media/momentum-today', ar: 860 / 1864, h: 1, to: 'ex-07', label: 'Momentum', phone: true, g: 0 },
];

const ROOMS = [
{
  id: 'field', numeral: '01', name: 'Field work',
  note: 'Electrical apprentice, Powerworks · Summer 2026',
  exhibits: [{
    kind: 'salon', no: '01',
    title: 'Seven sites, one summer',
    year: '2026', medium: '347 V and 120/208 V services · TECK, BX, conduit · Mircom FX-3500',
    text: 'Services, feeders and fire alarm work on commercial and residential builds, including programming the addressable fire alarm on a $9.6M three-storey building and walking its CAN/ULC-S537 verification.',
    photos: [
      { area: 'a', src: 'media/field-meters-1', cap: 'From the pole-mounted transformer to the disconnect, splitter and meters.', w: 1179, h: 1572 },
      { area: 'b', src: 'media/field-roof-row', cap: 'Rooftop maintenance on the box units.', w: 1179, h: 1494 },
      { area: 'c', src: 'media/field-fa-board', cap: 'Inside the Mircom fire alarm panel during troubleshooting.', w: 1179, h: 1689 },
      { area: 'd', src: 'media/field-roof-unit', cap: 'One of the rooftop boxes.', w: 1179, h: 1572 },
      { area: 'e', src: 'media/field-box-inside', cap: 'What was inside the box.', w: 1179, h: 1526 },
      { area: 'f', src: 'media/field-meters-2', cap: 'Disconnects and splitter feeding the meter bank.', w: 1179, h: 884 },
      { area: 'g', src: 'media/field-fa-panel', cap: 'Mircom panel boards, NACs disconnected to isolate the fault.', w: 1179, h: 1142 },
    ],
  }],
},
{
  id: 'measure', numeral: '02', name: 'Measured projects',
  note: 'Built to answer a question with data',
  exhibits: [
  {
    kind: 'piece', no: '02',
    title: 'Why is one room colder?',
    year: '2026', medium: 'ESP32 · BME280 · BH1750 · Python · Microsoft Excel · an RC circuit model',
    text: 'A sensor node logs the room every 10 seconds; weather data and a thermal RC model turn it into one number per room, the time constant τ. Room A measures about 24 hours. Room B is being logged now.',
    img: { src: 'media/fig-env_overview', w: 1600, h: 689, light: true, cap: 'Night one, Oct 3–4: room, outdoor temperature and nine detected furnace cycles.' },
    links: [['Report', 'docs/#report-cold'], ['Slides', 'docs/#slides'], ['Workbook', 'docs/#workbook']],
  },
  {
    kind: 'video', no: '03',
    title: 'A lamp that listens',
    year: '2026', medium: 'ESP32 · IRLZ44N MOSFET · 12 V LED strip · BH1750 · Python, numpy FFT',
    text: 'Closed-loop dimming that holds a brightness within one sensor count, then a music mode that reads the audio stream itself. Four versions, each scored against an independent beat tracker before I picked one.',
    video: { src: 'media/lamp-music.mp4', poster: 'media/lamp-music-poster.jpg', w: 360, h: 640, cap: 'The lamp behind my monitor, reacting to “Risk It All”.' },
    side: [
      { src: 'media/lamp-breadboard', w: 1600, h: 2133, cap: 'The breadboard build: ESP32, MOSFET, light sensor.' },
      { src: 'media/fig-audio_tradeoff', w: 1600, h: 932, light: true, cap: 'Six styles, two songs: punch against calm. Mellow kept.' },
    ],
    links: [['Test report', 'docs/#report-lamp'], ['Slides', 'docs/#slides-13']],
  }],
},
{
  id: 'boards', numeral: '03', name: 'Circuit boards',
  note: 'Schematic, layout and 3D, all designed in Altium',
  exhibits: [{ kind: 'duo', items: [
  {
    kind: 'piece', no: '04',
    title: 'Under water, out of reach',
    year: '2025–', medium: 'Altium Designer · Teensy 4.0 · CAN bus · 4-layer PCB',
    text: 'Electrical work on the university\u2019s autonomous submarine (ARVP). Once the hull is sealed nothing can be reseated, so the job is making the wrong connection physically impossible. My onboarding board was fabricated.',
    img: { src: 'img/arvp-onboard-3d', w: 959, h: 962, light: true, cap: 'Teensy 4.0 carrier, designed end to end.' },
    views: [
      { label: '3D', model: 'models/arvp.glb', src: 'img/arvp-onboard-3d', cap: 'Rev A, fabricated. Drag to turn it; Top / Side snap the camera.' },
      { label: 'Layout', src: 'img/arvp-onboard-layout', w: 932, h: 895, plate: '#000', cap: 'Top layer. Red is top copper, blue is bottom; an internal layer is GND.' },
      { label: 'Schematic', src: 'img/arvp-onboard-schematic', w: 1497, h: 990, plate: '#fffcf8', cap: 'Seven blocks: power, payload connector, Hall sensor, MCU, temperature, CAN, analog.' },
    ],
  },
  {
    kind: 'piece', no: '05', flip: true,
    title: 'Bare silicon',
    year: '2025', medium: 'STM32F411 · MPU-6050 · AMS1117 · 4 layers, two ground planes',
    text: 'A microcontroller board with nothing borrowed from a dev kit: USB power, clock, reset, boot straps and SWD debug, all mine to get right. 36 parts.',
    img: { src: 'img/stm32-3d', w: 998, h: 971, light: true, cap: 'STM32F411 IMU board in Altium 3D.' },
    views: [
      { label: '3D', model: 'models/stm32.glb', src: 'img/stm32-3d', cap: 'USB in on the right, regulator below it, IMU top left. Drag to turn it.' },
      { label: 'Schematic', src: 'img/stm32-sch-full', w: 1608, h: 1028, plate: '#fffcf8', cap: 'Three blocks: USB power and LDO, the STM32F411 with clock / reset / SWD, and the MPU-6050.' },
      { label: 'Power', src: 'img/stm32-sch-power', plate: '#fffcf8', cap: 'Micro-B USB, 120 \u03a9 ferrite bead, AMS1117-3.3, power LED.' },
      { label: 'MCU', src: 'img/stm32-sch-mcu', plate: '#fffcf8', cap: '24 MHz crystal, decoupling on every supply pin, BOOT0 pulled down, NRST pull-up, SWD header.' },
      { label: 'IMU', src: 'img/stm32-sch-imu', plate: '#fffcf8', cap: 'MPU-6050 on I\u00b2C at 0x68 with 2.2 k\u03a9 pull-ups, INT to PB8.' },
    ],
  }] }],
},
{
  id: 'software', numeral: '04', name: 'Software',
  note: 'Software I wrote because I needed it',
  exhibits: [
  {
    kind: 'piece', no: '06',
    title: 'Counting fixtures so I don\u2019t have to',
    year: '2026', medium: 'Python · PyMuPDF · electrical drawings',
    text: 'Reads the lighting fixture schedule out of a PDF drawing set, counts every tag per sheet for the quantity takeoff, and boxes each count in red so a person can check it by eye instead of trusting it.',
    img: { src: 'media/takeoff-qa', w: 1600, h: 1200, light: true, cap: 'QA overlay on a public 13-sheet set: every counted tag boxed.' },
  },
  {
    kind: 'pair', no: '07', flip: true,
    title: 'Momentum',
    year: '2026', medium: 'HTML · JavaScript · WebGL shader · used daily',
    text: 'The habit app I run my week on. Its rules are the point: every habit has a bad-day minimum, and missing one day is fine but missing two in a row breaks the chain.',
    imgs: [{ src: 'media/momentum-today', w: 860, h: 1864, cap: 'Day 41.' }, { src: 'media/momentum-peak', w: 860, h: 1864, cap: 'Day 105, top tier.' }],
  }],
},
];
