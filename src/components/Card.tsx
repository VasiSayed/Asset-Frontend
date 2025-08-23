// import React from "react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface InfoCardProps {
  title: string;
  content: string | ReactNode;
  image?: string;
  actions?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-md border p-4 shadow-sm bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-2 font-semibold text-lg">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3>{children}</h3>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="text-sm text-gray-700">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-4 text-xs text-gray-500">{children}</div>;
}

export default function InfoCard({
  title = "Product Overview",
  content = "This is a brief summary of the product.",
  image = "https://example.com/image.jpg",
  actions = <button className="text-blue-600 font-medium">Learn More</button>,
  className = "rounded-lg shadow-md p-4 bg-white",
  footer = <div>Updated today</div>,
}: InfoCardProps) {
  return (
    <Card className={className}>
      {image && <img src={image} alt={title} className="rounded mb-3 w-full object-cover" />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {actions && <div className="mt-4">{actions}</div>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
