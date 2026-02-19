import { CheckCircle2 } from "lucide-react";

interface BenefitBulletsProps {
  benefits: string[];
}

export default function BenefitBullets({ benefits }: BenefitBulletsProps) {
  return (
    <ul className="space-y-3 my-8">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-3 text-gray-700">
          <CheckCircle2 className="text-green-500 shrink-0" size={20} />
          <span className="text-[15px] font-medium leading-tight">{benefit}</span>
        </li>
      ))}
    </ul>
  );
}
