import { isFileProtocol } from "./assets-paths";

interface ContentData {
  contact?: {
    company?: string;
    address?: string;
    email?: string;
    phone?: string;
    phoneTel?: string;
  };
}

function escapeHtmlContent(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function escapeHtmlAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function loadContentJson(): Promise<void> {
  if (isFileProtocol()) return;
  try {
    const res = await fetch("/content.json");
    if (!res.ok) return;
    const data = (await res.json()) as ContentData;
    if (!data?.contact) return;

    const contactCompany = document.getElementById("contact-company");
    if (contactCompany && data.contact.company) {
      contactCompany.innerHTML =
        `<strong>${escapeHtmlContent(data.contact.company)}</strong>`;
    }
    const contactAddress = document.getElementById("contact-address");
    if (contactAddress && data.contact.address) {
      contactAddress.innerHTML = escapeHtmlContent(data.contact.address).replace(
        /\n/g,
        "<br />",
      );
    }
    const contactEmail = document.getElementById("contact-email");
    if (contactEmail && data.contact.email) {
      const em = escapeHtmlContent(data.contact.email);
      contactEmail.innerHTML = `<a href="mailto:${escapeHtmlAttr(data.contact.email)}">${em}</a>`;
    }
    const contactPhone = document.getElementById("contact-phone");
    if (contactPhone && data.contact.phone) {
      const tel =
        data.contact.phoneTel ||
        data.contact.phone.replace(/\s/g, "").replace(/^0/, "+33");
      const label = escapeHtmlContent(data.contact.phone);
      contactPhone.innerHTML = `<a href="tel:${escapeHtmlAttr(tel)}">${label}</a>`;
    }
  } catch {
    /* keep default HTML */
  }
}
