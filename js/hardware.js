/* hardware.js — real design data extracted from Anmol's Altium files
   (C:/Users/Anmol/Documents/Altium/Altium/ESP32 Lamp/Sheet3.SchDoc, PCB3.PcbDoc)
   by parsing the OLE compound documents. Nothing here is invented:
   designators, values and part numbers are what's on the sheet. */

var LAMP_BOM = [
  ['Q1', 'RJK1003DPP-A0', 'N-channel MOSFET · 100 V · 50 A · TO-220FPA', 'Low-side LED switch'],
  ['R1', '100 Ω', 'Yageo · 0603', 'Gate series — limits GPIO current, damps ringing'],
  ['R2', '100 kΩ', 'TE RQ73C1J100KBTD · 0.1 %', 'Gate pull-down — undefined means off'],
  ['C1', '220 µF', 'Aluminium electrolytic · 50 V', 'Bulk storage at the 12 V input'],
  ['C5', '100 µF', 'Ceramic X5R · 1206', 'Local bulk at the switching node'],
  ['C2 C3 C4', '100 nF', 'Ceramic X7R · 0603', 'High-frequency decoupling'],
  ['R3 R4', '4.7 kΩ', 'Thick film · 0603', 'I²C pull-ups to 3.3 V'],
  ['J1 J2', '15-pos', '0.1" receptacles', 'ESP32 dev-board carrier'],
  ['J3', '694103304002', 'Würth WR-DC power jack', '12 V in'],
  ['J4', '4-pos', 'Molex 0705430003', 'Light sensor (I²C)'],
  ['J6', '691253500002', '5.08 mm rising-cage terminal', 'LED strip out']
];
var LAMP_NETS = ['+12V', 'LED_NEG', 'MOSFET', 'D18', 'D21', 'D22', '3V3', 'GND'];

/* Power stage, redrawn from the Altium sheet. currentColor = accent. */
var LAMP_SCHEMATIC = `<svg class="sch" viewBox="0 0 760 400" fill="none" role="img"
  aria-label="Schematic of the lamp power stage: 12 volt input with bulk and decoupling capacitors, LED strip on the 12 volt rail switched on its low side by MOSFET Q1, whose gate is driven from ESP32 pin D18 through R1 with R2 pulling the gate to ground.">
  <defs><marker id="arw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M0 0L8 4 0 8z" fill="#6B7686"/></marker></defs>
  <g class="w">
    <!-- rails -->
    <path d="M150 50H700"/><path d="M30 360H700"/>
    <!-- J3 12V in -->
    <path d="M110 38h40v24h-40zM150 50h0"/>
    <!-- C1 polarised -->
    <path d="M200 50v132M184 182h32M184 196q16-8 32 0M200 192v168"/>
    <!-- C2 -->
    <path d="M250 50v132M236 182h28M236 190h28M250 190v170"/>
    <!-- LED strip on J6 -->
    <path d="M470 50v40M470 150v48"/>
    <path d="M454 104h32l-16 26zM454 130h32"/>
    <path d="M492 104l12-10M498 112l12-10"/>
    <!-- Q1 -->
    <path d="M470 198v12h-12M470 250v110M458 250h12"/>
    <path d="M452 206v48M458 204v12M458 224v12M458 244v12"/>
    <path d="M458 230h12v20"/>
    <!-- gate network -->
    <path d="M150 238h58"/>
    <path d="M208 238h8l5-9 10 18 10-18 10 18 10-18 10 18 5-9h8"/>
    <path d="M284 238H452"/>
    <path d="M390 238v24l-9 5 18 10-18 10 18 10-18 10 9 5v48"/>
    <!-- C5 / C4 local -->
    <path d="M580 50v132M566 182h28M566 190h28M580 190v170"/>
    <path d="M640 50v132M626 182h28M626 190h28M640 190v170"/>
    <!-- ESP32 carrier -->
    <path d="M30 150h120v170H30z"/>
    <path d="M150 272h6v34M150 298h6" class="thin"/>
  </g>
  <g class="dot"><circle cx="200" cy="50" r="3.2"/><circle cx="250" cy="50" r="3.2"/><circle cx="470" cy="50" r="3.2"/>
    <circle cx="580" cy="50" r="3.2"/><circle cx="390" cy="238" r="3.2"/><circle cx="200" cy="360" r="3.2"/>
    <circle cx="250" cy="360" r="3.2"/><circle cx="390" cy="360" r="3.2"/><circle cx="470" cy="360" r="3.2"/><circle cx="580" cy="360" r="3.2"/></g>
  <path class="hot" d="M470 150v48" />
  <path class="gate" d="M150 238h58M284 238H452"/>
  <g class="t">
    <text x="112" y="30">J3</text><text x="116" y="55" class="s">12V</text>
    <text x="664" y="44">+12V</text><text x="664" y="354">GND</text>
    <text x="164" y="210">C1</text><text x="160" y="224" class="s">220µ</text>
    <text x="262" y="210">C2</text><text x="262" y="224" class="s">100n</text>
    <text x="500" y="84">J6 LED+</text><text x="500" y="160">J6 LED−</text>
    <text x="500" y="186" class="n">LED_NEG</text>
    <text x="490" y="228">Q1</text><text x="490" y="242" class="s">RJK1003DPP</text>
    <text x="232" y="222">R1</text><text x="228" y="262" class="s">100Ω</text>
    <text x="404" y="292">R2</text><text x="404" y="306" class="s">100k</text>
    <text x="318" y="230" class="n">MOSFET</text>
    <text x="592" y="210">C5</text><text x="592" y="224" class="s">100µ</text>
    <text x="652" y="210">C4</text><text x="652" y="224" class="s">100n</text>
    <text x="40" y="170">ESP32</text><text x="40" y="184" class="s">J1 · J2 carrier</text>
    <text x="104" y="242" class="s">D18</text><text x="104" y="276" class="s">D21</text><text x="104" y="302" class="s">D22</text>
    <text x="160" y="318" class="s">D21/D22 SDA·SCL → J4 sensor · R3 R4 4.7k · C3</text>
  </g>
  <path d="M184 272h0" marker-end="url(#arw)"/>
  <text x="30" y="392" class="cap">POWER STAGE · REDRAWN FROM SHEET3.SCHDOC · 15 PARTS · 8 NETS</text>
</svg>`;

if (typeof module !== 'undefined') module.exports = { LAMP_BOM, LAMP_NETS, LAMP_SCHEMATIC };
