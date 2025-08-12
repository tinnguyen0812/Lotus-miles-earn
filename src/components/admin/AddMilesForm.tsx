"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";

type TxnType =
  | "flight"
  | "hotel"
  | "car-rental"
  | "bonus"
  | "promotion"
  | "compensation"
  | "other";

export function AddMilesForm() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    memberId: "",
    miles: "",
    transactionType: "" as TxnType | "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (field: keyof typeof formData, value: string) =>
    setFormData((s) => ({ ...s, [field]: value }));

  const reset = () =>
    setFormData({ memberId: "", miles: "", transactionType: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.miles || !formData.transactionType) return;

    const milesNum = Number(formData.miles);
    if (Number.isNaN(milesNum) || milesNum <= 0) {
      toast({
        variant: "destructive",
        title: t("admin.addMiles.toast.invalidMilesTitle"),
        description: t("admin.addMiles.toast.invalidMilesDesc"),
      });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: chỉnh đúng endpoint backend của bạn
      await callApi<{ success: boolean }>({
        method: "POST",
        path: "/admin/miles/manual-credit",
        body: {
          member_id: formData.memberId,
          miles: milesNum,
          txn_type: formData.transactionType,
          notes: formData.notes,
        },
      });

      setDone(true);
      toast({
        title: t("admin.addMiles.toast.successTitle"),
        description: t("admin.addMiles.toast.successDesc", {
          miles: milesNum.toLocaleString(),
          member: formData.memberId,
        }),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("admin.addMiles.toast.failedTitle"),
        description: err?.message || t("common.unexpectedError"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("admin.addMiles.done.title")}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("admin.addMiles.done.desc", {
                miles: Number(formData.miles).toLocaleString(),
                member: formData.memberId,
              })}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setDone(false);
                  reset();
                }}
              >
                {t("admin.addMiles.done.addAnother")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{t("admin.addMiles.title")}</h1>
        <p className="text-gray-600">{t("admin.addMiles.subtitle")}</p>
    </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              {t("admin.addMiles.form.sectionTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="memberId">{t("admin.addMiles.form.memberId")}</Label>
                  <Input
                    id="memberId"
                    placeholder={t("admin.addMiles.form.memberIdPh") || ""}
                    value={formData.memberId}
                    onChange={(e) => onChange("memberId", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="miles">{t("admin.addMiles.form.miles")}</Label>
                  <Input
                    id="miles"
                    type="number"
                    placeholder={t("admin.addMiles.form.milesPh") || ""}
                    value={formData.miles}
                    onChange={(e) => onChange("miles", e.target.value)}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionType">
                  {t("admin.addMiles.form.txnType")}
                </Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(v) => onChange("transactionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.addMiles.form.txnTypePh") || ""}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">{t("admin.addMiles.types.flight")}</SelectItem>
                    <SelectItem value="hotel">{t("admin.addMiles.types.hotel")}</SelectItem>
                    <SelectItem value="car-rental">{t("admin.addMiles.types.car")}</SelectItem>
                    <SelectItem value="bonus">{t("admin.addMiles.types.bonus")}</SelectItem>
                    <SelectItem value="promotion">{t("admin.addMiles.types.promo")}</SelectItem>
                    <SelectItem value="compensation">{t("admin.addMiles.types.comp")}</SelectItem>
                    <SelectItem value="other">{t("admin.addMiles.types.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("admin.addMiles.form.notes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("admin.addMiles.form.notesPh") || ""}
                  value={formData.notes}
                  onChange={(e) => onChange("notes", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {t("admin.addMiles.form.notesHint")}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  {t("admin.addMiles.summary.title")}
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    {t("admin.addMiles.summary.member")}:{" "}
                    {formData.memberId || t("admin.addMiles.summary.empty")}
                  </p>
                  <p>
                    {t("admin.addMiles.summary.miles")}:{" "}
                    {formData.miles
                      ? `+${Number(formData.miles).toLocaleString()}`
                      : t("admin.addMiles.summary.empty")}
                  </p>
                  <p>
                    {t("admin.addMiles.summary.type")}:{" "}
                    {formData.transactionType || t("admin.addMiles.summary.empty")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={
                    submitting ||
                    !formData.memberId ||
                    !formData.miles ||
                    !formData.transactionType
                  }
                >
                  {t("admin.addMiles.form.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-8 h-12"
                  onClick={reset}
                  disabled={submitting}
                >
                  {t("admin.addMiles.form.reset")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("admin.addMiles.recent.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { member: "LM-106751", miles: 2500, typeKey: "flight", date: "26/01/2024" },
                { member: "LM-108932", miles: 1200, typeKey: "hotel", date: "26/01/2024" },
                { member: "LM-105634", miles: 450, typeKey: "car", date: "25/01/2024" },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.member}</p>
                    <p className="text-xs text-gray-500">
                      {t(`admin.addMiles.types.${tx.typeKey as any}`)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +{tx.miles.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
