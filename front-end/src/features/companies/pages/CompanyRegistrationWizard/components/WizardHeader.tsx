interface WizardHeaderProps {
  title: string;
  description: string;
}

export const WizardHeader = ({ title, description }: WizardHeaderProps) => {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
