import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
      <div className="text-center max-w-md">
        <p className="text-display-lg font-heading text-primary">404</p>
        <h1 className="mt-4 text-headline-lg font-heading">Página não encontrada</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          A página que você procura não existe ou foi movida.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard">Voltar para o início</Link>
        </Button>
      </div>
    </div>
  );
}
