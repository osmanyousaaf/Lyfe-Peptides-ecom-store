"use client";

import { useEffect } from "react";
import { markReadAction } from "@/app/admin/(panel)/messages/actions";

// Opening a new message marks it read, like any mail app.
export default function MarkRead({ id }: { id: number }) {
  useEffect(() => {
    void markReadAction(id);
  }, [id]);
  return null;
}
