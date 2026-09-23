import type { Metadata } from "next";
import ForjaEnem from "@/components/ForjaEnem";
import "./forja.css";

export const metadata: Metadata = {
  title: "Forja Química ENEM | AppQuímica",
  description: "Questões de Química do ENEM em um laboratório interativo de revisão.",
};

export default function ForjaEnemPage() {
  return <ForjaEnem />;
}
