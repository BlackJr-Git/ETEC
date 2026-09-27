import { demandes, messages, reservations } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

const TYPE_LABELS = [
  { type: "achat", sujets: ["Achat d'espace", "Demande de concession"] },
  {
    type: "funerailles",
    sujets: ["Organisation funerailles", "Prise en charge obseques"],
  },
  {
    type: "diaspora",
    sujets: ["Information famille a l'etranger", "Demarche depuis la Belgique"],
  },
  {
    type: "renseignement",
    sujets: ["Renseignement tarifs", "Disponibilite Kinshasa"],
  },
  {
    type: "reclamation",
    sujets: ["Reclamation prestation", "Demande de remboursement"],
  },
];

const VILLES = ["Kinshasa", "Lubumbashi"];
const SITES = [
  "Cimetiere central",
  "Necropole du fleuve",
  "Site de la Gombe",
  null,
  null,
];
const NOMS = [
  "Jean-Pierre Mbuyi",
  "Marie Kabongo",
  "Patrick Tshibangu",
  "Sophie Ilunga",
  "Andre Kimbangu",
  "Grace Mutombo",
  "Charles Lumumba",
  "Esther Kiese",
  "Francois Tshisekedi",
  "Claudine Mabika",
  "Robert Kabila",
  "Aline Kadima",
];
const PHONES = [
  "+243 999 123 456",
  "+243 828 987 654",
  "+243 850 456 789",
  "+243 976 321 654",
];
const MESSAGES = [
  "Bonjour, je souhaite obtenir des informations concernant vos prestations. Merci de me recontacter rapidement.",
  "Pouvez-vous m'indiquer les demarches a suivre depuis la Belgique ? Ma famille souhaite organiser l'enterrement a Kinshasa.",
  "Je souhaiterais reserver une visite pour ce vendredi matin, si possible.",
  "J'ai envoye un message il y a deux jours et je n'ai toujours pas de nouvelles. Merci de traiter ma demande.",
  "Merci pour votre reponse. Comment proceder pour le paiement ?",
  "Demande urgente : nous avons besoin d'un espace disponible dans les plus brefs delais.",
  "Pouvez-vous m'envoyer un devis detaille par e-mail ?",
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number, daysForward = 0) {
  const now = Date.now();
  const offset =
    (Math.floor(Math.random() * daysBack) - daysBack + daysForward) *
    24 *
    60 *
    60 *
    1000;
  return now + offset;
}

function makeEmail() {
  return `${Math.random().toString(36).slice(2, 8)}@demo.test`;
}

export async function POST(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifie.", 401);

  try {
    const db = getDatabase();

    const demandeRows = Array.from({ length: 12 }).map(() => {
      const { type } = pick(TYPE_LABELS);
      const ville = pick(VILLES);
      const createdAt = randomDate(30);
      return {
        id: crypto.randomUUID(),
        type,
        nom: pick(NOMS),
        telephone: pick(PHONES),
        email: Math.random() > 0.3 ? makeEmail() : null,
        ville,
        site: pick(SITES),
        message: pick(MESSAGES),
        createdAt,
        updatedAt: createdAt + Math.floor(Math.random() * 1_000_000),
        status: pick(["nouveau", "en_cours", "traite", "archive"]),
        notes: Math.random() > 0.7 ? "Note interne de suivi." : null,
      };
    });

    const messageRows = Array.from({ length: 10 }).map(() => {
      const createdAt = randomDate(30);
      return {
        id: crypto.randomUUID(),
        nom: pick(NOMS),
        telephone: Math.random() > 0.5 ? pick(PHONES) : null,
        email: Math.random() > 0.3 ? makeEmail() : null,
        sujet: pick([
          "Demande d'information",
          "Prise de rendez-vous",
          "Reclamation",
          "Remerciement",
          "Suivi de demande",
        ]),
        contenu: pick(MESSAGES),
        status: pick(["nouveau", "lu", "repondu", "archive"]),
        createdAt,
        updatedAt: createdAt + Math.floor(Math.random() * 1_000_000),
      };
    });

    const reservationRows = Array.from({ length: 8 }).map(() => {
      const dateReservation = randomDate(7, 14);
      const createdAt = randomDate(30);
      return {
        id: crypto.randomUUID(),
        demandeId: Math.random() > 0.6 ? pick(demandeRows).id : null,
        nom: pick(NOMS),
        telephone: pick(PHONES),
        email: Math.random() > 0.3 ? makeEmail() : null,
        ville: pick(VILLES),
        site: pick(SITES),
        dateReservation,
        type: pick(["visite", "concession", "obseques"]),
        statut: pick(["en_attente", "confirmee", "annulee"]),
        notes:
          Math.random() > 0.6 ? "Visite accompagnee par un conseiller." : null,
        createdAt,
        updatedAt: createdAt + Math.floor(Math.random() * 1_000_000),
      };
    });

    for (const row of demandeRows) {
      await db.insert(demandes).values(row);
    }
    for (const row of messageRows) {
      await db.insert(messages).values(row);
    }
    for (const row of reservationRows) {
      await db.insert(reservations).values(row);
    }

    return jsonResponse({
      inserted: {
        demandes: demandeRows.length,
        messages: messageRows.length,
        reservations: reservationRows.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return errorResponse(`Erreur lors du seed : ${message}`, 500);
  }
}
