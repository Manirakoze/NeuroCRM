const STORAGE_KEY = "neuro-crm-data";
const ACCOUNT_STORAGE_KEY = "neuro-crm-account";

const initialData = {
  families: [
    { id: "family-1", primaryContactName: "Ava Mitchell", email: "ava.mitchell@example.com", phone: "(555) 014-2801" },
    { id: "family-2", primaryContactName: "Jonas Reed", email: "jonas.reed@example.com", phone: "(555) 013-9142" },
  ],
  clients: [
    { id: "client-1", firstName: "Maya", lastName: "Mitchell", dateOfBirth: "2016-03-14", status: "Active", familyId: "family-1", notes: "Weekly occupational therapy." },
    { id: "client-2", firstName: "Eli", lastName: "Reed", dateOfBirth: "2018-09-08", status: "Active", familyId: "family-2", notes: "Speech support plan in progress." },
    { id: "client-3", firstName: "Noah", lastName: "Mitchell", dateOfBirth: "2014-11-22", status: "Waitlist", familyId: "family-1", notes: "Initial consultation booked." },
  ],
  reports: [],
};

function readData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
}

function writeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function newId(type) {
  return `${type}-${crypto.randomUUID()}`;
}

export function getAccount() {
  const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function registerAccount(data) {
  const account = { id: newId("user"), name: data.name.trim(), email: data.email.trim().toLowerCase() };
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function signInAccount(email) {
  const account = getAccount();
  if (!account || account.email !== email.trim().toLowerCase()) return null;
  return account;
}

export function signOutAccount() {
  localStorage.removeItem(ACCOUNT_STORAGE_KEY);
}

export async function getClients() {
  return readData().clients;
}

export async function getFamilies() {
  return readData().families;
}

export async function createClient(data) {
  const records = readData();
  const client = { ...data, id: newId("client") };
  records.clients.unshift(client);
  writeData(records);
  return client;
}

export async function updateClient(id, data) {
  const records = readData();
  records.clients = records.clients.map((client) => (client.id === id ? { ...client, ...data } : client));
  writeData(records);
}

export async function deleteClient(id) {
  const records = readData();
  records.clients = records.clients.filter((client) => client.id !== id);
  writeData(records);
}

export async function createFamily(data) {
  const records = readData();
  const family = { ...data, id: newId("family") };
  records.families.unshift(family);
  writeData(records);
  return family;
}

export async function updateFamily(id, data) {
  const records = readData();
  records.families = records.families.map((family) => (family.id === id ? { ...family, ...data } : family));
  writeData(records);
}

export async function deleteFamily(id) {
  const records = readData();
  records.families = records.families.filter((family) => family.id !== id);
  records.clients = records.clients.map((client) => (client.familyId === id ? { ...client, familyId: "" } : client));
  writeData(records);
}

export async function getReports() {
  return readData().reports || [];
}

export async function createReport(data) {
  const records = readData();
  const report = { ...data, id: newId("report"), createdAt: new Date().toISOString() };
  records.reports = records.reports || [];
  records.reports.unshift(report);
  writeData(records);
  return report;
}

export async function deleteReport(id) {
  const records = readData();
  records.reports = (records.reports || []).filter((report) => report.id !== id);
  writeData(records);
}