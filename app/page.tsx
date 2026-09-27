"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Globe2,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageSection } from "@/components/message-section";

const services = [
  {
    id: "achat",
    n: "01",
    title: "Acquérir un espace",
    text: "Exprimez votre besoin et recevez une réponse adaptée au site et à la ville souhaités.",
    action: "Faire une demande d’achat",
  },
  {
    id: "funerailles",
    n: "02",
    title: "Organiser des funérailles",
    text: "Échangez avec notre équipe sur les démarches et l’accompagnement dont votre famille a besoin.",
    action: "Demander un accompagnement",
  },
  {
    id: "diaspora",
    n: "03",
    title: "Être accompagné à distance",
    text: "Depuis l’étranger, désignez votre interlocuteur et préparez les échanges nécessaires avec nos équipes.",
    action: "Contacter l’équipe diaspora",
  },
];
const faqs = [
  [
    "Comment connaître les sites disponibles ?",
    "Indiquez Kinshasa ou Lubumbashi dans votre demande. Notre équipe pourra vous communiquer les sites concernés et les disponibilités actuelles.",
  ],
  [
    "Puis-je faire une demande depuis l’étranger ?",
    "Oui. Précisez votre pays de résidence, votre moyen de contact et la ville concernée. L’équipe pourra vous expliquer les étapes à distance.",
  ],
  [
    "Une demande d’achat vaut-elle réservation ?",
    "Non. L’envoi du formulaire ouvre un échange. Les disponibilités, conditions et modalités doivent être confirmées par l’équipe avant tout engagement.",
  ],
  [
    "Comment signaler un problème sur un site ?",
    "Utilisez le formulaire de signalement et réclamation en indiquant la ville, le site et les faits observés. Évitez de transmettre des informations médicales ou des documents sensibles dans le message.",
  ],
];
type Kind =
  | "achat"
  | "funerailles"
  | "diaspora"
  | "renseignement"
  | "reclamation";
const labels: Record<Kind, string> = {
  achat: "Demande d’achat",
  funerailles: "Accompagnement funéraire",
  diaspora: "Accompagnement diaspora",
  renseignement: "Demande de renseignements",
  reclamation: "Signalement ou réclamation",
};

export default function Home() {
  const [kind, setKind] = useState<Kind>("achat");
  const [menu, setMenu] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [reference, setReference] = useState("");
  const choose = (k: Kind) => {
    setKind(k);
    setStatus("idle");
    setMenu(false);
    document.getElementById("demande")?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool?: (tool: unknown, options?: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "start_request",
          title: "Préparer une demande",
          description:
            "Sélectionner le type de demande et afficher le formulaire correspondant.",
          inputSchema: {
            type: "object",
            properties: { type: { type: "string", enum: Object.keys(labels) } },
            required: ["type"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: unknown) => {
            const type = (input as { type?: Kind })?.type;
            if (!type || !(type in labels))
              throw new Error("Type de demande invalide");
            choose(type);
            return { type, label: labels[type] };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: kind }),
      });
      const result = (await response.json()) as {
        error?: string;
        reference: string;
      };
      if (!response.ok) throw new Error(result.error);
      setReference(result.reference);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }
  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href="#accueil"
          aria-label="Entre Terre et Ciel, accueil"
        >
          <span className="brand-icon">✧</span>
          <span>
            <strong>ENTRE TERRE ET CIEL</strong>
            <small>NÉCROPOLE · ETEC</small>
          </span>
        </a>
        <nav
          className={menu ? "nav open" : "nav"}
          aria-label="Navigation principale"
        >
          <a href="#approche" onClick={() => setMenu(false)}>
            Notre approche
          </a>
          <a href="#services" onClick={() => setMenu(false)}>
            Accompagnement
          </a>
          <a href="#questions" onClick={() => setMenu(false)}>
            Questions & réponses
          </a>
          <button onClick={() => choose("reclamation")}>Signalement</button>
        </nav>
        <button className="header-cta" onClick={() => choose("renseignement")}>
          Nous contacter <ArrowUpRight size={17} />
        </button>
        <button
          className="menu-button"
          aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="accueil">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <p className="eyebrow">
              <span className="line" /> Kinshasa & Lubumbashi
            </p>
            <h1 id="hero-title">
              Un lieu de mémoire.
              <br />
              <em>Un accompagnement humain.</em>
            </h1>
            <p className="hero-lead">
              Entre Terre et Ciel accompagne les familles dans leurs démarches,
              sur place et depuis l’étranger, avec clarté et respect.
            </p>
            <div className="hero-actions">
              <Button onClick={() => choose("funerailles")}>
                Être accompagné <ArrowUpRight size={17} />
              </Button>
              <button className="text-link" onClick={() => choose("achat")}>
                Demander des informations sur un espace <span>↗</span>
              </button>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="arch">
              <div className="tree">✧</div>
              <span>Entre Terre et Ciel</span>
            </div>
            <p>
              Des lieux pensés pour le recueillement,
              <br />
              une présence pour chaque étape.
            </p>
          </div>
          <div className="hero-bottom">
            <span>01 / 03 — PRÉSENCE</span>
            <span>
              Faire défiler pour découvrir <span aria-hidden="true">↓</span>
            </span>
          </div>
        </section>
        <section className="intro wrap" id="approche">
          <div>
            <p className="eyebrow dark">NOTRE APPROCHE</p>
            <h2>La dignité dans chaque détail.</h2>
          </div>
          <div>
            <p>
              Dans les moments qui comptent, les démarches doivent être simples
              à comprendre. Notre rôle est de vous orienter, répondre à vos
              questions et vous accompagner dans le choix d’un lieu de repos ou
              l’organisation des funérailles.
            </p>
            <div className="values">
              <span>
                <ShieldCheck size={20} /> Discrétion
              </span>
              <span>
                <HeartHandshake size={20} /> Écoute
              </span>
              <span>
                <MapPin size={20} /> Proximité
              </span>
            </div>
          </div>
        </section>
        <section className="services" id="services">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow dark">
                  COMMENT POUVONS-NOUS VOUS AIDER ?
                </p>
                <h2>
                  À chaque famille,
                  <br />
                  <em>une réponse attentive.</em>
                </h2>
              </div>
              <p>
                Une première prise de contact suffit pour nous expliquer votre
                situation. Notre équipe vous orientera vers la suite appropriée.
              </p>
            </div>
            <div className="service-grid">
              {services.map((s) => (
                <article className="service-card" key={s.id}>
                  <span className="card-num">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                  <button onClick={() => choose(s.id as Kind)}>
                    {s.action} <ArrowUpRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="locations wrap">
          <div>
            <p className="eyebrow dark">NOS IMPLANTATIONS</p>
            <h2>
              À Kinshasa
              <br />
              et à Lubumbashi.
            </h2>
            <p>
              Plusieurs sites sont disponibles selon la ville. Indiquez le site
              qui vous intéresse si vous le connaissez ; autrement, nous vous
              aiderons à identifier le bon interlocuteur.
            </p>
          </div>
          <div className="location-list">
            <button onClick={() => choose("renseignement")}>
              <span>
                01 <strong>Kinshasa</strong>
              </span>
              <ArrowUpRight />
            </button>
            <button onClick={() => choose("renseignement")}>
              <span>
                02 <strong>Lubumbashi</strong>
              </span>
              <ArrowUpRight />
            </button>
            <div className="location-note">
              <Globe2 size={25} />
              <p>
                Vous résidez hors de la RDC ? Nous pouvons commencer les
                échanges à distance.
              </p>
              <button onClick={() => choose("diaspora")}>
                Contacter l’équipe diaspora ↗
              </button>
            </div>
          </div>
        </section>
        <section className="contact-section" id="demande">
          <div className="wrap contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">PRENDRE CONTACT</p>
              <h2>
                Parlez-nous de
                <br />
                <em>votre besoin.</em>
              </h2>
              <p>
                Votre message est transmis à l’équipe Entre Terre et Ciel. Un
                membre de l’équipe pourra reprendre contact avec vous à l’aide
                des coordonnées indiquées.
              </p>
              <div className="contact-note">
                <MessageCircle size={24} />
                <span>
                  Pour une situation urgente, indiquez-le clairement dans votre
                  message. Le formulaire ne constitue pas un service d’urgence.
                </span>
              </div>
            </div>
            <div className="form-panel">
              {status === "success" ? (
                <div className="success" role="status">
                  <span>✓</span>
                  <h3>Votre demande est enregistrée.</h3>
                  <p>
                    Conservez la référence <strong>{reference}</strong> pour
                    votre suivi. Notre équipe pourra vous recontacter avec les
                    coordonnées indiquées.
                  </p>
                  <button onClick={() => setStatus("idle")}>
                    Envoyer une autre demande ↗
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <h3>Votre demande</h3>
                  <label>
                    Je souhaite
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value as Kind)}
                    >
                      {Object.entries(labels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-row">
                    <label>
                      Nom et prénom
                      <input
                        name="nom"
                        autoComplete="name"
                        required
                        maxLength={120}
                        placeholder="Votre nom"
                      />
                    </label>
                    <label>
                      Téléphone / WhatsApp
                      <input
                        name="telephone"
                        type="tel"
                        autoComplete="tel"
                        required
                        maxLength={40}
                        placeholder="+243 …"
                      />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Ville concernée
                      <select name="ville" required defaultValue="">
                        <option value="" disabled>
                          Choisir une ville
                        </option>
                        <option>Kinshasa</option>
                        <option>Lubumbashi</option>
                      </select>
                    </label>
                    <label>
                      Site concerné (si connu)
                      <input
                        name="site"
                        maxLength={120}
                        placeholder="Nom du site"
                      />
                    </label>
                  </div>
                  <label>
                    Adresse e-mail (facultatif)
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={180}
                      placeholder="vous@exemple.com"
                    />
                  </label>
                  <label>
                    Votre message
                    <textarea
                      name="message"
                      required
                      maxLength={3000}
                      rows={4}
                      placeholder={
                        kind === "diaspora"
                          ? "Précisez votre pays de résidence et la meilleure façon de vous joindre."
                          : kind === "reclamation"
                            ? "Décrivez le site concerné, la date et les faits observés."
                            : "Expliquez-nous brièvement votre besoin."
                      }
                    />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" name="accord" required />
                    <span>
                      J’accepte que mes coordonnées et mon message soient
                      utilisés pour traiter cette demande.
                    </span>
                  </label>
                  <Button type="submit" disabled={status === "sending"}>
                    {status === "sending"
                      ? "Envoi en cours…"
                      : "Envoyer la demande"}{" "}
                    <ArrowUpRight size={17} />
                  </Button>
                  {status === "error" && (
                    <p className="form-error" role="alert">
                      L’envoi n’a pas abouti. Vérifiez votre connexion et
                      réessayez ; votre message est toujours dans le formulaire.
                    </p>
                  )}
                  <p className="form-small">
                    Ne transmettez pas de données médicales, documents
                    d’identité ou informations bancaires dans ce formulaire.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
        <MessageSection />
        <section className="faq wrap" id="questions">
          <div>
            <p className="eyebrow dark">RENSEIGNEMENTS</p>
            <h2>Questions fréquentes</h2>
            <p>
              Une autre question ?{" "}
              <button onClick={() => choose("renseignement")}>
                Écrivez-nous ↗
              </button>
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={21} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <strong>ENTRE TERRE ET CIEL</strong>
            <p>Nécropole · Kinshasa & Lubumbashi</p>
          </div>
          <p>Un espace de mémoire, une présence pour les familles.</p>
          <button onClick={() => choose("reclamation")}>
            Signalement & réclamation ↗
          </button>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} ETEC asbl</span>
          <span>
            Informations et conditions à confirmer auprès de l’équipe.
          </span>
        </div>
      </footer>
    </>
  );
}
