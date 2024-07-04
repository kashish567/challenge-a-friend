"use client";
import { Button } from "@/components/ui/button";

interface Props {
  text: string;
  onClick: () => void;
}

const CustomButton: React.FC<Props> = ({ text, onClick }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="border-2 border-black p-8 rounded-2xl"
    >
      {text}
    </Button>
  );
};

export default CustomButton;
