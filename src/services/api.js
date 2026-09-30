import { isSupabaseConfigured, supabase } from "./supabase";

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
  enrollmentLinks: [
    { id: "intake-general", program: "General intake", active: true, createdAt: "2026-09-27T00:00:00.000Z" },
  ],
  enrollments: [],
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

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function toClient(record) {
  return { id: record.id, firstName: record.first_name, lastName: record.last_name, dateOfBirth: record.date_of_birth || "", status: record.status, familyId: record.family_id || "", notes: record.notes || "" };
}

function toFamily(record) {
  return { id: record.id, primaryContactName: record.primary_contact_name, email: record.email, phone: record.phone || "" };
}

function toReport(record) {
  return { id: record.id, clientId: record.client_id, childName: record.child_name, fromDate: record.from_date, toDate: record.to_date, hourlyRate: record.hourly_rate, totalHours: record.total_hours, totalAmount: record.total_amount, parentName: record.parent_name, parentEmail: record.parent_email || "", parentPhone: record.parent_phone || "", parentAddress: record.parent_address || "", financialManager: record.financial_manager || "", claimReference: record.claim_reference || "", notes: record.notes || "", entries: record.entries || [], createdAt: record.created_at };
}

function toLink(record) {
  return { id: record.id, program: record.program, active: record.active, createdAt: record.created_at };
}

export async function getSessionAccount() {
  if (!isSupabaseConfigured) return getAccount();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) return null;
  return { id: data.session.user.id, name: data.session.user.user_metadata.full_name || data.session.user.email, email: data.session.user.email };
}

export function onAccountChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ? { id: session.user.id, name: session.user.user_metadata.full_name || session.user.email, email: session.user.email } : null));
  return () => data.subscription.unsubscribe();
}

export async function registerUser(data) {
  if (!isSupabaseConfigured) return { account: registerAccount(data), message: "" };
  const { data: authData, error } = await supabase.auth.signUp({ email: data.email.trim(), password: data.password, options: { data: { full_name: data.name.trim() } } });
  if (error) return { account: null, message: error.message };
  return { account: authData.session?.user ? { id: authData.session.user.id, name: data.name.trim(), email: authData.session.user.email } : null, message: authData.session ? "" : "Check your email to confirm your account, then sign in." };
}

export async function signInUser(data) {
  if (!isSupabaseConfigured) return { account: signInAccount(data.email), message: "" };
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email: data.email.trim(), password: data.password });
  if (error) return { account: null, message: error.message };
  return { account: { id: authData.user.id, name: authData.user.user_metadata.full_name || authData.user.email, email: authData.user.email }, message: "" };
}

export async function signOutUser() {
  if (isSupabaseConfigured) await supabase.auth.signOut();
  signOutAccount();
}

export async function getClients() {
  if (isSupabaseConfigured) return unwrap(await supabase.from("clients").select("*").order("created_at", { ascending: false })).map(toClient);
  return readData().clients;
}

export async function getFamilies() {
  if (isSupabaseConfigured) return unwrap(await supabase.from("families").select("*").order("created_at", { ascending: false })).map(toFamily);
  return readData().families;
}

export async function createClient(data) {
  if (isSupabaseConfigured) return toClient(unwrap(await supabase.from("clients").insert({ first_name: data.firstName, last_name: data.lastName, date_of_birth: data.dateOfBirth || null, status: data.status, family_id: data.familyId || null, notes: data.notes || null }).select().single()));
  const records = readData();
  const client = { ...data, id: newId("client") };
  records.clients.unshift(client);
  writeData(records);
  return client;
}

export async function updateClient(id, data) {
  if (isSupabaseConfigured) { unwrap(await supabase.from("clients").update({ first_name: data.firstName, last_name: data.lastName, date_of_birth: data.dateOfBirth || null, status: data.status, family_id: data.familyId || null, notes: data.notes || null }).eq("id", id)); return; }
  const records = readData();
  records.clients = records.clients.map((client) => (client.id === id ? { ...client, ...data } : client));
  writeData(records);
}

export async function deleteClient(id) {
  if (isSupabaseConfigured) { unwrap(await supabase.from("clients").delete().eq("id", id)); return; }
  const records = readData();
  records.clients = records.clients.filter((client) => client.id !== id);
  writeData(records);
}

export async function createFamily(data) {
  if (isSupabaseConfigured) return toFamily(unwrap(await supabase.from("families").insert({ primary_contact_name: data.primaryContactName, email: data.email, phone: data.phone || null }).select().single()));
  const records = readData();
  const family = { ...data, id: newId("family") };
  records.families.unshift(family);
  writeData(records);
  return family;
}

export async function updateFamily(id, data) {
  if (isSupabaseConfigured) { unwrap(await supabase.from("families").update({ primary_contact_name: data.primaryContactName, email: data.email, phone: data.phone || null }).eq("id", id)); return; }
  const records = readData();
  records.families = records.families.map((family) => (family.id === id ? { ...family, ...data } : family));
  writeData(records);
}

export async function deleteFamily(id) {
  if (isSupabaseConfigured) { unwrap(await supabase.from("families").delete().eq("id", id)); return; }
  const records = readData();
  records.families = records.families.filter((family) => family.id !== id);
  records.clients = records.clients.map((client) => (client.familyId === id ? { ...client, familyId: "" } : client));
  writeData(records);
}

export async function getReports() {
  if (isSupabaseConfigured) return unwrap(await supabase.from("reports").select("*").order("created_at", { ascending: false })).map(toReport);
  return readData().reports || [];
}

export async function createReport(data) {
  if (isSupabaseConfigured) return toReport(unwrap(await supabase.from("reports").insert({ client_id: data.clientId || null, child_name: data.childName, from_date: data.fromDate, to_date: data.toDate, hourly_rate: data.hourlyRate, total_hours: data.totalHours, total_amount: data.totalAmount, parent_name: data.parentName, parent_email: data.parentEmail || null, parent_phone: data.parentPhone || null, parent_address: data.parentAddress || null, financial_manager: data.financialManager || null, claim_reference: data.claimReference || null, notes: data.notes || null, entries: data.entries }).select().single()));
  const records = readData();
  const report = { ...data, id: newId("report"), createdAt: new Date().toISOString() };
  records.reports = records.reports || [];
  records.reports.unshift(report);
  writeData(records);
  return report;
}

export async function deleteReport(id) {
  if (isSupabaseConfigured) { unwrap(await supabase.from("reports").delete().eq("id", id)); return; }
  const records = readData();
  records.reports = (records.reports || []).filter((report) => report.id !== id);
  writeData(records);
}

export async function getEnrollmentLinks() {
  if (isSupabaseConfigured) return unwrap(await supabase.from("enrollment_links").select("*").order("created_at", { ascending: false })).map(toLink);
  return readData().enrollmentLinks || [];
}

export async function createEnrollmentLink(program) {
  if (isSupabaseConfigured) return toLink(unwrap(await supabase.from("enrollment_links").insert({ program: program.trim() }).select().single()));
  const records = readData();
  const link = { id: newId("enroll"), program: program.trim(), active: true, createdAt: new Date().toISOString() };
  records.enrollmentLinks = records.enrollmentLinks || [];
  records.enrollmentLinks.unshift(link);
  writeData(records);
  return link;
}

export async function getEnrollmentLink(id) {
  if (isSupabaseConfigured) { const data = unwrap(await supabase.rpc("get_public_enrollment_link", { enrollment_link_id: id })); return data[0] ? { id: data[0].id, program: data[0].program, active: true } : null; }
  return (readData().enrollmentLinks || []).find((link) => link.id === id && link.active) || null;
}

export async function getEnrollments() {
  if (isSupabaseConfigured) return unwrap(await supabase.from("enrollments").select("*").order("submitted_at", { ascending: false })).map((record) => ({ id: record.id, linkId: record.link_id, clientId: record.client_id, parentName: record.parent_name, parentEmail: record.parent_email, childName: record.child_name, program: record.program, status: record.status, submittedAt: record.submitted_at }));
  return readData().enrollments || [];
}

export async function submitEnrollment(linkId, data) {
  if (isSupabaseConfigured) return unwrap(await supabase.rpc("submit_enrollment", { enrollment_link_id: linkId, contact_name: data.parentName, contact_email: data.parentEmail, contact_phone: data.parentPhone, child_first_name: data.childFirstName, child_last_name: data.childLastName, child_birth_date: data.dateOfBirth }));
  const records = readData();
  const link = (records.enrollmentLinks || []).find((record) => record.id === linkId && record.active);
  if (!link) throw new Error("This enrollment link is unavailable.");

  const normalizedEmail = data.parentEmail.trim().toLowerCase();
  let family = records.families.find((record) => record.email.toLowerCase() === normalizedEmail);
  if (!family) {
    family = { id: newId("family"), primaryContactName: data.parentName.trim(), email: normalizedEmail, phone: data.parentPhone.trim() };
    records.families.unshift(family);
  }

  const client = { id: newId("client"), firstName: data.childFirstName.trim(), lastName: data.childLastName.trim(), dateOfBirth: data.dateOfBirth, status: "Waitlist", familyId: family.id, notes: `Enrollment: ${link.program}` };
  records.clients.unshift(client);
  const enrollment = { id: newId("enrollment"), linkId, program: link.program, parentName: family.primaryContactName, parentEmail: family.email, childName: `${client.firstName} ${client.lastName}`, clientId: client.id, consent: true, status: "Submitted", submittedAt: new Date().toISOString() };
  records.enrollments = records.enrollments || [];
  records.enrollments.unshift(enrollment);
  writeData(records);
  return enrollment;
}