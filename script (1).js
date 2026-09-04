const residents=[
  {id:"SA-001",name:"Juan Dela Cruz",age:42,status:"Active",purok:"Purok 1"},
  {id:"SA-002",name:"Maria Santos",age:35,status:"Active",purok:"Purok 2"},
  {id:"SA-003",name:"Pedro Reyes",age:58,status:"Active",purok:"Purok 3"},
  {id:"SA-004",name:"Ana Garcia",age:27,status:"Active",purok:"Purok 4"},
  {id:"SA-005",name:"Ramon Bautista",age:64,status:"Senior",purok:"Purok 5"}
];
const certificates=[
  ["Barangay Clearance","Maria Santos","Pending"],
  ["Certificate of Residency","Juan Dela Cruz","Approved"],
  ["Certificate of Indigency","Ana Garcia","Processing"]
];
const reports=[
  ["CR-001","Road / Infrastructure","Street light needs repair","Open"],
  ["CR-002","Community Safety","Noise complaint","Under review"],
  ["CR-003","Environment","Waste collection concern","Open"]
];
const announcements=[
  ["Free Medical Check-up","Community health services are available this week.","Today"],
  ["Barangay Assembly Meeting","Residents are invited to the upcoming barangay assembly.","2 days ago"],
  ["Community Clean-up Drive","Join the clean-up activity in designated areas.","5 days ago"]
];

const app=document.getElementById("app"), title=document.getElementById("pageTitle");
function dashboard(){
  title.textContent="Dashboard";
  app.innerHTML=`<div class="hero"><h2>Good Evening, Barangay San Agustin!</h2><p>Welcome to your digital barangay management portal.</p></div>
  <div class="grid">
    <div class="card"><div class="stat-label">Registered Residents</div><div class="stat-value">${residents.length}</div><div class="muted">Current records</div></div>
    <div class="card"><div class="stat-label">Certificates Issued</div><div class="stat-value">24</div><div class="muted">This month</div></div>
    <div class="card"><div class="stat-label">Critical Reports</div><div class="stat-value">${reports.length}</div><div class="muted">Currently open / active</div></div>
    <div class="card"><div class="stat-label">Announcements</div><div class="stat-value">${announcements.length}</div><div class="muted">Recent notices</div></div>
  </div>
  <div class="section-grid">
    <div class="card"><h2>Recent Critical Reports</h2>${reports.map(r=>`<div class="row"><div><b>${r[1]}</b><div class="muted">${r[2]}</div></div><span class="badge warn">${r[3]}</span></div>`).join("")}</div>
    <div class="card"><h2>System Activity</h2>${announcements.map(a=>`<div class="notice"><b>${a[0]}</b><div class="muted">${a[2]}</div></div>`).join("")}</div>
  </div>`;
}
function residentsPage(){
  title.textContent="Residents";
  app.innerHTML=`<div class="toolbar"><input class="search" id="residentSearch" placeholder="Search residents..."><button class="btn" onclick="alert('Demo: connect this button to your database later.')">+ Add Resident</button></div><div class="card" style="padding:0"><table class="table"><thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Purok</th><th>Status</th></tr></thead><tbody id="residentBody"></tbody></table></div>`;
  renderResidents("");
  document.getElementById("residentSearch").addEventListener("input",e=>renderResidents(e.target.value));
}
function renderResidents(q){const body=document.getElementById("residentBody");body.innerHTML=residents.filter(r=>(r.name+" "+r.id+" "+r.purok).toLowerCase().includes(q.toLowerCase())).map(r=>`<tr><td>${r.id}</td><td><b>${r.name}</b></td><td>${r.age}</td><td>${r.purok}</td><td><span class="badge good">${r.status}</span></td></tr>`).join("")||`<tr><td colspan="5" class="empty">No residents found.</td></tr>`}
function certificatesPage(){title.textContent="Certificates";app.innerHTML=`<div class="toolbar"><input class="search" placeholder="Search certificate requests..."><button class="btn" onclick="alert('Demo certificate request form')">+ New Request</button></div><div class="card" style="padding:0"><table class="table"><thead><tr><th>Document</th><th>Resident</th><th>Status</th></tr></thead><tbody>${certificates.map(c=>`<tr><td>${c[0]}</td><td>${c[1]}</td><td><span class="badge ${c[2]==="Approved"?"good":"warn"}">${c[2]}</span></td></tr>`).join("")}</tbody></table></div>`}
function reportsPage(){title.textContent="Critical Reports";app.innerHTML=`<div class="toolbar"><input class="search" placeholder="Search reports..."><button class="btn" onclick="alert('Demo report form')">+ Submit Report</button></div><div class="card" style="padding:0"><table class="table"><thead><tr><th>ID</th><th>Category</th><th>Subject</th><th>Status</th></tr></thead><tbody>${reports.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="badge warn">${r[3]}</span></td></tr>`).join("")}</tbody></table></div>`}
function announcementsPage(){title.textContent="Announcements";app.innerHTML=`<div class="toolbar"><div></div><button class="btn" onclick="alert('Demo announcement form')">+ New Announcement</button></div><div class="section-grid">${announcements.map(a=>`<div class="card"><span class="badge">${a[2]}</span><h2 style="margin-top:13px">${a[0]}</h2><div class="muted">${a[1]}</div></div>`).join("")}</div>`}
const pages={dashboard,residents:residentsPage,certificates:certificatesPage,reports:reportsPage,announcements:announcementsPage};
document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");pages[btn.dataset.page]();}));
dashboard();