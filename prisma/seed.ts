import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database for ProCPX...');

  // 1. Seed Tenants
  const tenantsData = [
    {
      id: 'TNT-LNT-001',
      key: 'TNT_LNT',
      name: 'L&T Infra & Construction Ltd',
      short: 'LT',
      project: 'Metro Line 4 Underground & Stations',
      vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
      users: [
        { role: 'PROJECT_TEAM', name: 'Rahul Verma', title: 'Senior Project Engineer (Site Lead)' },
        { role: 'PROJECT_HEAD_PR', name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
        { role: 'CATEGORY_MANAGER', name: 'Vikram Mehta', title: 'Lead Category Manager (Interior & Fitouts)' },
        { role: 'CATEGORY_MANAGER_2', name: 'Rajesh Singhania', title: 'Head of Strategic Sourcing' },
        { role: 'PROJECT_HEAD_PPO', name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
        { role: 'FINANCE_HEAD', name: 'Sunil Deshmukh', title: 'Chief Financial Officer' },
        { role: 'VENDOR', name: 'DesignCraft Millworks Pvt Ltd', title: 'Approved Tier-1 Joinery Contractor' }
      ]
    },
    {
      id: 'TNT-TATA-002',
      key: 'TNT_TATA',
      name: 'Tata Projects Global',
      short: 'TP',
      project: 'Noida International Airport Terminal 1',
      vendor: 'Tata Steel & BlueStar Chiller Div',
      users: [
        { role: 'PROJECT_TEAM', name: 'Siddharth Rao', title: 'Package Lead Engineer' },
        { role: 'PROJECT_HEAD_PR', name: 'Capt. R. K. Nair', title: 'Project Director' },
        { role: 'CATEGORY_MANAGER', name: 'Megha Sen', title: 'Senior Procurement Manager' },
        { role: 'CATEGORY_MANAGER_2', name: 'Arunav Roy', title: 'Chief Procurement Officer' },
        { role: 'PROJECT_HEAD_PPO', name: 'Capt. R. K. Nair', title: 'Project Director' },
        { role: 'FINANCE_HEAD', name: 'G. Swaminathan', title: 'VP - Commercial & Finance' },
        { role: 'VENDOR', name: 'Tata Steel & BlueStar Chiller Div', title: 'OEM Strategic Partner' }
      ]
    },
    {
      id: 'TNT-GODREJ-003',
      key: 'TNT_GODREJ',
      name: 'Godrej Properties & Living',
      short: 'GP',
      project: 'Godrej Sky Terraces Luxury Highrise',
      vendor: 'Godrej Interio Enterprise',
      users: [
        { role: 'PROJECT_TEAM', name: 'Karan Joshi', title: 'Site In-charge (Architecture)' },
        { role: 'PROJECT_HEAD_PR', name: 'Rohan Godrej', title: 'Regional Projects Head' },
        { role: 'CATEGORY_MANAGER', name: 'Divya Nair', title: 'Category Manager (Interior Works)' },
        { role: 'CATEGORY_MANAGER_2', name: 'Pradeep Khurana', title: 'Head - Central Procurement' },
        { role: 'PROJECT_HEAD_PPO', name: 'Rohan Godrej', title: 'Regional Projects Head' },
        { role: 'FINANCE_HEAD', name: 'Deepak Varma', title: 'Financial Controller' },
        { role: 'VENDOR', name: 'Godrej Interio Enterprise', title: 'Approved Millwork Vendor' }
      ]
    },
    {
      id: 'TNT-SHAPOORJI-004',
      key: 'TNT_SHAPOORJI',
      name: 'Shapoorji Pallonji Real Estate',
      short: 'SP',
      project: 'Parkwest Tech Park Phase 3',
      vendor: 'SP Fabricators & Interior Solutions',
      users: [
        { role: 'PROJECT_TEAM', name: 'Tanmay Saxena', title: 'Senior Construction Manager' },
        { role: 'PROJECT_HEAD_PR', name: 'Farokh Mistry', title: 'Executive VP - Infra' },
        { role: 'CATEGORY_MANAGER', name: 'Cyrus Broacha', title: 'Procurement Specialist' },
        { role: 'CATEGORY_MANAGER_2', name: 'Neville Tata', title: 'Head of Global Procurement' },
        { role: 'PROJECT_HEAD_PPO', name: 'Farokh Mistry', title: 'Executive VP - Infra' },
        { role: 'FINANCE_HEAD', name: 'Ratan Mehta', title: 'Director of Finance' },
        { role: 'VENDOR', name: 'SP Fabricators & Interior Solutions', title: 'Registered Contractor' }
      ]
    }
  ];

  for (const t of tenantsData) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: {
        key: t.key,
        name: t.name,
        short: t.short,
        project: t.project,
        vendor: t.vendor
      },
      create: {
        id: t.id,
        key: t.key,
        name: t.name,
        short: t.short,
        project: t.project,
        vendor: t.vendor,
        users: {
          create: t.users.map(u => ({ role: u.role, name: u.name, title: u.title }))
        }
      }
    });
  }

  // 2. Seed Vendors
  const vendors = [
    { id: 'VND-001', name: 'Vendor 1 (DesignCraft Millworks)', category: 'Interior & Fitouts', rating: 4.9, isRateCard: true, city: 'Mumbai', leadTime: '7-10 Days' },
    { id: 'VND-002', name: 'Vendor 2 (Apex Modular Systems)', category: 'Interior & Fitouts', rating: 4.8, isRateCard: true, city: 'Pune', leadTime: '10-14 Days' },
    { id: 'VND-005', name: 'Vendor 5 (NorthCraft Engineering)', category: 'Interior & Fitouts', rating: 4.5, isRateCard: false, city: 'Noida', leadTime: '14-18 Days' },
    { id: 'VND-014', name: 'Vendor 14 (CoolTech Systems)', category: 'MEP & HVAC', rating: 4.9, isRateCard: true, city: 'Mumbai', leadTime: '15-20 Days' },
    { id: 'VND-015', name: 'Vendor 15 (BlueStar Industrial)', category: 'MEP & HVAC', rating: 4.8, isRateCard: true, city: 'Pune', leadTime: '14-18 Days' }
  ];

  for (const v of vendors) {
    await prisma.vendorMaster.upsert({
      where: { id: v.id },
      update: v,
      create: v
    });
  }

  // 3. Seed Primary Requisition: PR-2026-0005
  await prisma.purchaseRequest.upsert({
    where: { id: 'PR-2026-0005' },
    update: {},
    create: {
      id: 'PR-2026-0005',
      tenantId: 'TNT-LNT-001',
      title: 'Fabrication & Installation of Reception Counter (Counter Elevation D)',
      projectName: 'Metro Line 4 Underground & Stations',
      costCentre: 'CC-104 (Finishing, Interior & Millwork)',
      category: 'Interior & Fitouts',
      requester: 'Rahul Verma (Site Lead)',
      reqDate: '2026-09-25',
      status: 'SUBMITTED',
      buyer: 'Vikram Mehta (Category Manager)',
      remarks: 'Reception Counter & Lobby Joinery Package (PKG-2026-INT-001).',
      items: {
        create: [
          { code: 'CNT-TOP-GRN20', desc: '20mm thick Polished Jet Black Granite Countertop', uom: 'Sqm', qty: 12.5, rateCard: 3550, benchmark: 3450, std: 3500, aiConf: '98%', mleoM: 2100, mleoL: 850, mleoE: 300, mleoO: 300 },
          { code: 'CNT-PLY-BWP18', desc: 'Marine Grade Boiling Water Proof (BWP) Plywood 18mm IS 710', uom: 'Sqm', qty: 38.0, rateCard: 1520, benchmark: 1480, std: 1500, aiConf: '97%', mleoM: 920, mleoL: 380, mleoE: 100, mleoO: 120 },
          { code: 'CNT-LAM-1MM', desc: '1.0mm thick High Pressure Textured Decorative Laminate', uom: 'Sqm', qty: 24.0, rateCard: 890, benchmark: 850, std: 880, aiConf: '96%', mleoM: 520, mleoL: 220, mleoE: 70, mleoO: 80 },
          { code: 'CNT-HDW-SOFT', desc: 'Joinery & Hardware Package: Soft-close hinges & slides', uom: 'Set', qty: 14.0, rateCard: 1780, benchmark: 1720, std: 1750, aiConf: '95%', mleoM: 1100, mleoL: 450, mleoE: 100, mleoO: 130 },
          { code: 'CNT-LED-PROF', desc: '12V DC Warm White LED Strip Light in recessed channel', uom: 'Rmt', qty: 16.0, rateCard: 420, benchmark: 400, std: 410, aiConf: '93%', mleoM: 260, mleoL: 90, mleoE: 30, mleoO: 40 },
          { code: 'CNT-SKT-SS304', desc: '100mm high Stainless Steel Grade 304 Brushed Skirting', uom: 'Rmt', qty: 14.0, rateCard: 780, benchmark: 750, std: 770, aiConf: '94%', mleoM: 480, mleoL: 180, mleoE: 50, mleoO: 70 }
        ]
      },
      quotes: {
        create: [
          { vendorId: 'VND-001', initialRate: 162260, revisedRate: 154000, gst: 18, leadTime: '12 Days', validTill: '2026-09-30', isL1: true },
          { vendorId: 'VND-002', initialRate: 174800, revisedRate: 164000, gst: 18, leadTime: '14 Days', validTill: '2026-09-30', isL1: false }
        ]
      },
      negotiations: {
        create: [
          { round: 1, user: 'Vendor 1 (VND-001)', type: 'Original Quotation', rate: 162260, remarks: 'Initial competitive bid submitted against tender specifications.', timestamp: '2026-09-06 10:30' },
          { round: 2, user: 'Rahul Verma (Category Manager)', type: 'Buyer Counter-Offer', rate: 148500, remarks: 'Reference AI MLEO cost model on granite and joinery. Volume rate requested with 45-day payment cycle.', timestamp: '2026-09-06 14:15' }
        ]
      }
    }
  });

  // 4. Seed PPO and PO
  await prisma.pPOItem.upsert({
    where: { id: 'PPO-2026-0015' },
    update: {},
    create: {
      id: 'PPO-2026-0015',
      tenantId: 'TNT-LNT-001',
      prId: 'PR-2026-0005',
      vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
      itemDesc: 'Reception Counter & Lobby Joinery Package (PKG-2026-INT-001)',
      unitRate: 148500,
      qty: 1,
      totalVal: 148500,
      taxRate: 18,
      taxAmount: 26730,
      grandTotal: 175230,
      paymentTerms: '30 Days Net from delivery & QC signoff',
      leadTime: '12 Calendar Days',
      status: 'TIER_1_PENDING'
    }
  });

  await prisma.purchaseOrder.upsert({
    where: { id: 'PO-2026-0089' },
    update: {},
    create: {
      id: 'PO-2026-0089',
      tenantId: 'TNT-LNT-001',
      ppoId: 'PPO-2026-0015',
      prId: 'PR-2026-0005',
      vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
      amount: 175230,
      issueDate: '2026-09-06',
      deliveryDate: '2026-09-25',
      status: 'ISSUED'
    }
  });

  // 5. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { timestamp: '2026-09-06 14:45', user: 'Vikram Mehta (Category Mgr)', role: 'CATEGORY_MANAGER', action: 'PPO Generated', targetId: 'PPO-2026-0015', details: 'Created PPO-2026-0015 for DesignCraft Millworks.' },
      { timestamp: '2026-09-06 11:20', user: 'Vikram Mehta (Category Mgr)', role: 'CATEGORY_MANAGER', action: 'AI Cost Analysis Invoked', targetId: 'PR-2026-0005', details: 'Deconstructed Reception Counter into MLEO cost pillars.' },
      { timestamp: '2026-08-25 10:12', user: 'Vikram Mehta (Buyer)', role: 'CATEGORY_MANAGER', action: 'PPO Generated', targetId: 'PPO-2026-0012', details: 'Created PPO-2026-0012 for Vertex Infratech.' }
    ],
    skipDuplicates: true
  });

  console.log('PostgreSQL database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
