"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Label> & { required?: boolean };

export function FieldLabel({ required, className, children, ...rest }: Props) {
  return (
    <Label
      {...rest}
      className={cn(
        className,
        required && "after:content-['*'] after:ml-1 after:text-red-500"
      )}
    >
      {children}
    </Label>
  );
}
