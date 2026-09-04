import type { Metadata } from "next";
import { PublishWizard } from "@/components/create/publish-wizard";

export const metadata: Metadata = {
  title: "Подать объявление",
  description: "Разместите объявление о недвижимости или автомобиле за несколько шагов.",
};

export default function CreatePage() {
  return <PublishWizard />;
}
