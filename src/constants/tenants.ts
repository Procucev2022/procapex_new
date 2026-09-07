import { TenantKey, TenantConfig } from '@/types';

export const TENANTS: Record<TenantKey, TenantConfig> = {
  'TNT_LNT': {
    id: 'TNT-LNT-001',
    name: 'L&T Infra & Construction Ltd',
    short: 'LT',
    project: 'Metro Line 4 Underground & Stations',
    vendor: 'DesignCraft Millworks & Interiors Pvt Ltd',
    team: {
      'PROJECT_TEAM': { name: 'Rahul Verma', title: 'Senior Project Engineer (Site Lead)' },
      'PROJECT_HEAD_PR': { name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
      'CATEGORY_MANAGER': { name: 'Vikram Mehta', title: 'Lead Category Manager (Interior & Fitouts)' },
      'CATEGORY_MANAGER_2': { name: 'Rajesh Singhania', title: 'Head of Strategic Sourcing' },
      'PROJECT_HEAD_PPO': { name: 'Anil Kulkarni', title: 'Vice President (Projects)' },
      'FINANCE_HEAD': { name: 'Sunil Deshmukh', title: 'Chief Financial Officer' },
      'VENDOR': { name: 'DesignCraft Millworks Pvt Ltd', title: 'Approved Tier-1 Joinery Contractor' }
    }
  },
  'TNT_TATA': {
    id: 'TNT-TATA-002',
    name: 'Tata Projects Global',
    short: 'TP',
    project: 'Noida International Airport Terminal 1',
    vendor: 'Tata Steel & BlueStar Chiller Div',
    team: {
      'PROJECT_TEAM': { name: 'Siddharth Rao', title: 'Package Lead Engineer' },
      'PROJECT_HEAD_PR': { name: 'Capt. R. K. Nair', title: 'Project Director' },
      'CATEGORY_MANAGER': { name: 'Megha Sen', title: 'Senior Procurement Manager' },
      'CATEGORY_MANAGER_2': { name: 'Arunav Roy', title: 'Chief Procurement Officer' },
      'PROJECT_HEAD_PPO': { name: 'Capt. R. K. Nair', title: 'Project Director' },
      'FINANCE_HEAD': { name: 'G. Swaminathan', title: 'VP - Commercial & Finance' },
      'VENDOR': { name: 'Tata Steel & BlueStar Chiller Div', title: 'OEM Strategic Partner' }
    }
  },
  'TNT_GODREJ': {
    id: 'TNT-GODREJ-003',
    name: 'Godrej Properties & Living',
    short: 'GP',
    project: 'Godrej Sky Terraces Luxury Highrise',
    vendor: 'Godrej Interio Enterprise',
    team: {
      'PROJECT_TEAM': { name: 'Karan Joshi', title: 'Site In-charge (Architecture)' },
      'PROJECT_HEAD_PR': { name: 'Rohan Godrej', title: 'Regional Projects Head' },
      'CATEGORY_MANAGER': { name: 'Divya Nair', title: 'Category Manager (Interior Works)' },
      'CATEGORY_MANAGER_2': { name: 'Pradeep Khurana', title: 'Head - Central Procurement' },
      'PROJECT_HEAD_PPO': { name: 'Rohan Godrej', title: 'Regional Projects Head' },
      'FINANCE_HEAD': { name: 'Deepak Varma', title: 'Financial Controller' },
      'VENDOR': { name: 'Godrej Interio Enterprise', title: 'Approved Millwork Vendor' }
    }
  },
  'TNT_SHAPOORJI': {
    id: 'TNT-SHAPOORJI-004',
    name: 'Shapoorji Pallonji Real Estate',
    short: 'SP',
    project: 'Parkwest Tech Park Phase 3',
    vendor: 'SP Fabricators & Interior Solutions',
    team: {
      'PROJECT_TEAM': { name: 'Tanmay Saxena', title: 'Senior Construction Manager' },
      'PROJECT_HEAD_PR': { name: 'Farokh Mistry', title: 'Executive VP - Infra' },
      'CATEGORY_MANAGER': { name: 'Cyrus Broacha', title: 'Procurement Specialist' },
      'CATEGORY_MANAGER_2': { name: 'Neville Tata', title: 'Head of Global Procurement' },
      'PROJECT_HEAD_PPO': { name: 'Farokh Mistry', title: 'Executive VP - Infra' },
      'FINANCE_HEAD': { name: 'Ratan Mehta', title: 'Director of Finance' },
      'VENDOR': { name: 'SP Fabricators & Interior Solutions', title: 'Registered Contractor' }
    }
  }
};
