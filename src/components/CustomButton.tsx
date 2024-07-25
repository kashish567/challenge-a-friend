"use client";
import { Button } from "@/components/ui/button";

interface Props {
  text: string;
  onClick: () => void;
  className?: string;
}

const CustomButton: React.FC<Props> = ({ text, onClick, className }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`border-2 border-black p-8 rounded-2xl ${className}`}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
