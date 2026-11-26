/* Annual production estimates. Country shares use each report's published denominator. */
(() => {
  const countries = {
    AR: ['Αργεντινή', -38, -64], AU: ['Αυστραλία', -25, 134],
    BR: ['Βραζιλία', -10, -52], CA: ['Καναδάς', 57, -104],
    CL: ['Χιλή', -30, -71], CN: ['Κίνα', 35, 103],
    CD: ['ΛΔ Κονγκό', -3, 24], FR: ['Γαλλία', 46, 2],
    DE: ['Γερμανία', 51, 10], GH: ['Γκάνα', 8, -1],
    GR: ['Ελλάδα', 39, 22], GN: ['Γουινέα', 10, -10],
    IN: ['Ινδία', 22, 79], ID: ['Ινδονησία', -3, 117],
    JP: ['Ιαπωνία', 37, 138], KZ: ['Καζακστάν', 48, 68],
    MX: ['Μεξικό', 24, -103], NA: ['Ναμίμπια', -22, 17],
    NO: ['Νορβηγία', 62, 10], PE: ['Περού', -10, -75],
    PT: ['Πορτογαλία', 40, -8], RU: ['Ρωσία', 60, 95],
    ZA: ['Νότια Αφρική', -29, 25], AE: ['Ην. Αραβικά Εμιράτα', 24, 54],
    US: ['ΗΠΑ', 39, -98], ZW: ['Ζιμπάμπουε', -19, 30],
  };
  const usgs2015 = 'https://apps.usgs.gov/minerals-information-archives/mcs/mcs2015.pdf';
  const usgs2025 = 'https://pubs.usgs.gov/periodicals/mcs2025/mcs2025.pdf';
  function rows(values, total) {
    return Object.entries(values).sort((a, b) => b[1] - a[1]).map(([iso, value]) => {
      const [name, lat, lon] = countries[iso];
      return { iso, name, lat, lon, value, share: Math.round(1000 * value / total) / 10 };
    });
  }
  function mineral(year, unit, total, values, chapter, note) {
    const edition = year === 2014 ? 2015 : 2025;
    return {
      year, total, unit, countries: rows(values, total), note,
      source: edition === 2015 ? usgs2015 : usgs2025,
      sourceName: 'USGS ' + edition + ' · ' + chapter,
    };
  }
  function iea(share, sourceName, source, note) {
    return { year: 2024, total: 100, unit: '%', countries: rows({ CN: share }, 100), source, sourceName, note };
  }
  const stage = (id, label, snapshots) => ({ id, label, snapshots });
  const lithiumNote = 'Τόνοι περιεχόμενου λιθίου από ορυχεία και άλμες. Η USGS εξαιρεί τη μη δημοσιευμένη παραγωγή των ΗΠΑ από το σύνολο.';
  const copperMine = 'Χιλιάδες τόνοι περιεχόμενου χαλκού. Τα ποσοστά χρησιμοποιούν το στρογγυλοποιημένο παγκόσμιο σύνολο.';
  const goldMine = 'Τόνοι περιεχόμενου χρυσού από ορυχεία. Η ανακύκλωση καταγράφεται χωριστά από την εξόρυξη.';
  const siliconMetal = 'Χιλιάδες τόνοι μεταλλουργικού πυριτίου. Η παραγωγή των ΗΠΑ είναι εμπιστευτική και εξαιρείται. Το επόμενο στάδιο για χρήση σε chip απαιτεί καθαρισμό σε ηλεκτρονική ποιότητα.';
  const aluminiumSmelt = 'Χιλιάδες τόνοι πρωτογενούς αλουμινίου από ηλεκτρόλυση. Η ανακύκλωση αποτελεί ξεχωριστή πηγή μετάλλου.';

  window.MATTER_DATA = {
    lithium: { name: 'Λίθιο', symbol: 'Li', stages: [
      stage('mine', 'Εξόρυξη', [
        mineral(2014,'t',36000,{AU:13000,CL:12900,CN:5000,AR:2900,ZW:1000,PT:570,BR:400},'Lithium',lithiumNote),
        mineral(2024,'t',240000,{AU:88000,CL:49000,CN:41000,ZW:22000,AR:18000,BR:10000,CA:4300,NA:2700,PT:380},'Lithium',lithiumNote),
      ]),
      stage('refine','Επεξεργασία',[
        iea(70,'IEA · Global Critical Minerals Outlook 2025','https://www.iea.org/reports/global-critical-minerals-outlook-2025','Η Κίνα παρήγαγε περίπου το 70% των επεξεργασμένων χημικών ενώσεων λιθίου. Οι υπόλοιπες χώρες μαζί αντιστοιχούν στο 30%.'),
      ]),
      stage('cells','Κυψέλες EV',[
        iea(80,'IEA · Global EV Outlook 2025','https://www.iea.org/reports/global-ev-outlook-2025/electric-vehicle-batteries','Η Κίνα παρήγαγε το 80% των κυψελών στην αγορά ηλεκτρικών οχημάτων που εξετάζει η IEA. Το ποσοστό λειτουργεί ως κλαδικό σημείο αναφοράς. Η προέλευση της μπαταρίας ενός κινητού απαιτεί στοιχεία του κατασκευαστή.'),
      ]),
    ] },
    copper: { name: 'Χαλκός',symbol:'Cu', stages: [
      stage('mine','Εξόρυξη',[
        mineral(2014,'kt',18700,{CL:5800,CN:1620,PE:1400,US:1370,CD:1100,AU:1000,RU:850},'Copper',copperMine),
        mineral(2024,'kt',23000,{CL:5300,CD:3300,PE:2600,CN:1800,US:1100,ID:1100,RU:930},'Copper',copperMine),
      ]),
      stage('refine','Διύλιση',[
        mineral(2023,'kt',27000,{CN:12000,CD:2170,CL:2080,JP:1490,RU:1000,US:882},'Copper','Χιλιάδες τόνοι διυλισμένου χαλκού από πρωτογενείς και δευτερογενείς πηγές.'),
        mineral(2024,'kt',27000,{CN:12000,CD:2500,CL:1900,JP:1600,RU:960,US:890},'Copper','Χιλιάδες τόνοι διυλισμένου χαλκού από πρωτογενείς και δευτερογενείς πηγές.'),
      ]),
    ] },
    silicon: { name: 'Πυρίτιο',symbol:'Si', stages: [
      stage('metal','Μεταλλουργικό πυρίτιο',[
        mineral(2023,'kt',4280,{CN:3630,BR:196,NO:123,FR:90,DE:59,RU:54,AU:39},'Silicon',siliconMetal),
        mineral(2024,'kt',4600,{CN:3900,BR:190,NO:120,FR:90,DE:60,RU:50,AU:40},'Silicon',siliconMetal),
      ]),
    ] },
    aluminium: { name: 'Αλουμίνιο',symbol:'Al', stages: [
      stage('mine','Εξόρυξη βωξίτη',[
        mineral(2014,'kt',234000,{AU:81000,CN:47000,BR:32500,GN:19300,IN:19000,GR:2100},'Bauxite and alumina','Χιλιάδες τόνοι βωξίτη, της πρώτης ύλης για παραγωγή αλουμίνας.'),
        mineral(2024,'kt',450000,{GN:130000,AU:100000,CN:93000,BR:33000,ID:32000,IN:25000,GR:1200},'Bauxite and alumina','Χιλιάδες τόνοι βωξίτη. Η USGS εξαιρεί τη μη δημοσιευμένη παραγωγή των ΗΠΑ από το σύνολο.'),
      ]),
      stage('refine','Αλουμίνα',[
        mineral(2023,'kt',141000,{CN:82400,AU:18800,BR:11000,IN:7500,RU:3020,AE:2480,GR:869},'Bauxite and alumina','Χιλιάδες τόνοι παραγωγής αλουμίνας από διυλιστήρια.'),
        mineral(2024,'kt',142000,{CN:84000,AU:18000,BR:11000,IN:7600,RU:2900,AE:2400,GR:860},'Bauxite and alumina','Χιλιάδες τόνοι παραγωγής αλουμίνας από διυλιστήρια.'),
      ]),
      stage('smelt','Πρωτογενές μέταλλο',[
        mineral(2014,'kt',49300,{CN:23300,RU:3500,CA:2940,AE:2400,IN:2100,US:1720,AU:1680},'Aluminum',aluminiumSmelt),
        mineral(2024,'kt',72000,{CN:43000,IN:4200,RU:3800,CA:3300,AE:2700,AU:1500,NO:1300},'Aluminum',aluminiumSmelt),
      ]),
    ] },
    gold: { name: 'Χρυσός',symbol:'Au', stages: [
      stage('mine','Εξόρυξη',[
        mineral(2014,'t',2860,{CN:450,AU:270,RU:245,US:211,CA:160,PE:150,ZA:150},'Gold',goldMine),
        mineral(2024,'t',3300,{CN:380,RU:310,AU:290,CA:200,US:160,GH:130,KZ:130,MX:130},'Gold',goldMine),
      ]),
    ] },
  };
})();
