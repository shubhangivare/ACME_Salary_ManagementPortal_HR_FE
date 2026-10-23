import { Injectable, Pipe, PipeTransform, signal } from "@angular/core";

export type AppLanguage = "en" | "it" | "fr" | "gu" | "mr";

const messages: Record<AppLanguage, Record<string, string>> = {
  en: {},
  it: {
    Dashboard: "Dashboard",
    Employees: "Dipendenti",
    Compensation: "Retribuzione",
    "Import / Export": "Importa / Esporta",
    "Countries & currency": "Paesi e valuta",
    "Audit trail": "Registro di controllo",
    "Help & chatbot": "Aiuto e chatbot",
    "Log out ↗": "Esci ↗",
    "Add employee": "Aggiungi dipendente",
    Refresh: "Aggiorna",
    "Clear filters": "Cancella filtri",
    "All departments": "Tutti i reparti",
    "All Countries": "Tutti i paesi",
    "All statuses": "Tutti gli stati",
    Previous: "Precedente",
    Next: "Successivo",
    "Save employee": "Salva dipendente",
    "Back to directory": "Torna all’elenco",
    "Search name, ID, department…": "Cerca nome, ID, reparto…",
    "No employees match your filters. Try changing your search.":
      "Nessun dipendente corrisponde ai filtri. Modifica la ricerca.",
  },
  fr: {
    Dashboard: "Tableau de bord",
    Employees: "Employés",
    Compensation: "Rémunération",
    "Import / Export": "Importer / Exporter",
    "Countries & currency": "Pays et devise",
    "Audit trail": "Journal d’audit",
    "Help & chatbot": "Aide et chatbot",
    "Log out ↗": "Déconnexion ↗",
    "Add employee": "Ajouter un employé",
    Refresh: "Actualiser",
    "Clear filters": "Effacer les filtres",
    "All departments": "Tous les services",
    "All Countries": "Tous les pays",
    "All statuses": "Tous les statuts",
    Previous: "Précédent",
    Next: "Suivant",
    "Save employee": "Enregistrer",
    "Back to directory": "Retour à la liste",
    "Search name, ID, department…": "Rechercher nom, ID, service…",
    "No employees match your filters. Try changing your search.":
      "Aucun employé ne correspond aux filtres.",
  },
  gu: {
    Dashboard: "ડેશબોર્ડ",
    Employees: "કર્મચારીઓ",
    Compensation: "વળતર",
    "Import / Export": "આયાત / નિકાસ",
    "Countries & currency": "દેશો અને ચલણ",
    "Audit trail": "ઓડિટ ટ્રેલ",
    "Help & chatbot": "મદદ અને ચેટબોટ",
    "Log out ↗": "લૉગ આઉટ ↗",
    "Add employee": "કર્મચારી ઉમેરો",
    Refresh: "રીફ્રેશ",
    "Clear filters": "ફિલ્ટર સાફ કરો",
    "All departments": "બધા વિભાગો",
    "All Countries": "બધા દેશો",
    "All statuses": "બધી સ્થિતિઓ",
    Previous: "પાછળ",
    Next: "આગળ",
    "Save employee": "કર્મચારી સાચવો",
    "Back to directory": "યાદી પર પાછા જાઓ",
    "Search name, ID, department…": "નામ, ID, વિભાગ શોધો…",
    "No employees match your filters. Try changing your search.":
      "કોઈ કર્મચારી મળ્યો નથી. શોધ બદલો.",
  },
  mr: {
    Dashboard: "डॅशबोर्ड",
    Employees: "कर्मचारी",
    Compensation: "वेतन व्यवस्थापन",
    "Import / Export": "आयात / निर्यात",
    "Countries & currency": "देश आणि चलन",
    "Audit trail": "ऑडिट नोंद",
    "Help & chatbot": "मदत आणि चॅटबॉट",
    "Log out ↗": "बाहेर पडा ↗",
    "Add employee": "कर्मचारी जोडा",
    Refresh: "रिफ्रेश",
    "Clear filters": "फिल्टर साफ करा",
    "All departments": "सर्व विभाग",
    "All Countries": "सर्व देश",
    "All statuses": "सर्व स्थिती",
    Previous: "मागील",
    Next: "पुढील",
    "Save employee": "कर्मचारी जतन करा",
    "Back to directory": "यादीवर परत जा",
    "Search name, ID, department…": "नाव, ID, विभाग शोधा…",
    "No employees match your filters. Try changing your search.":
      "फिल्टरशी जुळणारे कर्मचारी नाहीत.",
  },
};

@Injectable({ providedIn: "root" })
export class TranslationService {
  readonly language = signal<AppLanguage>(
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("peoplepay-language") as AppLanguage)) ||
      "en",
  );
  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    if (typeof localStorage !== "undefined")
      localStorage.setItem("peoplepay-language", language);
  }
  translate(key: string): string {
    const language = this.language();
    const errors: Record<AppLanguage, Record<string, string>> = {
      en: {},
      it: {
        "Employee created successfully.": "Dipendente creato correttamente.",
        "Employee updated successfully.":
          "Dipendente aggiornato correttamente.",
        "Employee ID or email already exists.":
          "ID dipendente o email già esistente.",
        "Unable to save employee. Please check the fields and try again.":
          "Impossibile salvare il dipendente. Controlla i campi e riprova.",
        "Unable to deactivate employee. Please try again.":
          "Impossibile disattivare il dipendente. Riprova.",
        "Validation failed. Please correct the highlighted fields.":
          "Convalida non riuscita. Correggi i campi evidenziati.",
      },
      fr: {
        "Employee created successfully.": "Employé créé avec succès.",
        "Employee updated successfully.": "Employé mis à jour avec succès.",
        "Employee ID or email already exists.":
          "Cet identifiant employé ou cette adresse e-mail existe déjà.",
        "Unable to save employee. Please check the fields and try again.":
          "Impossible d’enregistrer l’employé. Vérifiez les champs et réessayez.",
        "Unable to deactivate employee. Please try again.":
          "Impossible de désactiver l’employé. Réessayez.",
        "Validation failed. Please correct the highlighted fields.":
          "Échec de validation. Corrigez les champs signalés.",
      },
      gu: {
        "Employee created successfully.": "કર્મચારી સફળતાપૂર્વક બનાવાયો.",
        "Employee updated successfully.": "કર્મચારી સફળતાપૂર્વક અપડેટ થયો.",
        "Employee ID or email already exists.":
          "કર્મચારી ID અથવા ઈમેલ પહેલેથી અસ્તિત્વમાં છે.",
        "Unable to save employee. Please check the fields and try again.":
          "કર્મચારી સાચવી શકાયો નથી. વિગતો તપાસીને ફરી પ્રયાસ કરો.",
        "Unable to deactivate employee. Please try again.":
          "કર્મચારી નિષ્ક્રિય કરી શકાયો નથી. ફરી પ્રયાસ કરો.",
        "Validation failed. Please correct the highlighted fields.":
          "માન્યતા નિષ્ફળ. દર્શાવેલ વિગતો સુધારો.",
      },
      mr: {
        "Employee created successfully.": "कर्मचारी यशस्वीरित्या तयार झाला.",
        "Employee updated successfully.":
          "कर्मचारी यशस्वीरित्या अद्ययावत झाला.",
        "Employee ID or email already exists.":
          "कर्मचारी ID किंवा ईमेल आधीपासून अस्तित्वात आहे.",
        "Unable to save employee. Please check the fields and try again.":
          "कर्मचारी जतन करता आला नाही. तपशील तपासून पुन्हा प्रयत्न करा.",
        "Unable to deactivate employee. Please try again.":
          "कर्मचारी निष्क्रिय करता आला नाही. पुन्हा प्रयत्न करा.",
        "Validation failed. Please correct the highlighted fields.":
          "पडताळणी अयशस्वी. दाखवलेली माहिती दुरुस्त करा.",
      },
    };
    return messages[language][key] ?? errors[language][key] ?? key;
  }
}

@Pipe({ name: "t", standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private translations: TranslationService) {}
  transform(value: string): string {
    return this.translations.translate(value);
  }
}
