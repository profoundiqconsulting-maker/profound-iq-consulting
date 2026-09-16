import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

const copy = {
  en: [
    "Page Not Found",
    "Sorry, the page you are looking for doesn't exist.",
    "It may have been moved or deleted.",
    "Go Home",
  ],
  sw: [
    "Ukurasa haujapatikana",
    "Samahani, ukurasa unaoutafuta haupo.",
    "Huenda umehamishwa au kufutwa.",
    "Nenda mwanzo",
  ],
  fr: [
    "Page introuvable",
    "Désolé, la page recherchée n'existe pas.",
    "Elle a peut-être été déplacée ou supprimée.",
    "Accueil",
  ],
  es: [
    "Página no encontrada",
    "Lo sentimos, la página que buscas no existe.",
    "Puede haberse movido o eliminado.",
    "Ir al inicio",
  ],
  pt: [
    "Página não encontrada",
    "Desculpe, a página que procura não existe.",
    "Pode ter sido movida ou eliminada.",
    "Ir para o início",
  ],
  ar: [
    "الصفحة غير موجودة",
    "عذراً، الصفحة التي تبحث عنها غير موجودة.",
    "ربما نُقلت أو حُذفت.",
    "العودة للرئيسية",
  ],
  zh: [
    "找不到页面",
    "抱歉，您查找的页面不存在。",
    "它可能已被移动或删除。",
    "返回首页",
  ],
  hi: [
    "पृष्ठ नहीं मिला",
    "क्षमा करें, आप जिस पृष्ठ को खोज रहे हैं वह मौजूद नहीं है।",
    "इसे स्थानांतरित या हटा दिया गया हो सकता है।",
    "होम पर जाएँ",
  ],
  de: [
    "Seite nicht gefunden",
    "Die gesuchte Seite existiert leider nicht.",
    "Sie wurde möglicherweise verschoben oder gelöscht.",
    "Zur Startseite",
  ],
  ja: [
    "ページが見つかりません",
    "申し訳ありません。お探しのページは存在しません。",
    "移動または削除された可能性があります。",
    "ホームへ戻る",
  ],
} as const;

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { locale } = useLocale();
  const [title, description, detail, home] = copy[locale] ?? copy.en;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f3e8]">
      <Card className="w-full max-w-lg mx-4 shadow-lg border border-[#16243d]/10 bg-white">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#c9a34e]/20 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[#c9a34e]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#16243d] mb-2">404</h1>
          <h2 className="text-xl font-semibold text-[#16243d] mb-4">{title}</h2>
          <p className="text-[#657084] mb-8 leading-relaxed">
            {description}
            <br />
            {detail}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              aria-label="Return to the Profound IQ Consulting homepage"
              onClick={() => setLocation("/")}
              className="bg-[#16243d] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              {home}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
