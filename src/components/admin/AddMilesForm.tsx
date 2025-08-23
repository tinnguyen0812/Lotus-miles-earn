"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { callApi } from "@/lib/api-client";
// import { useTranslation } from "@/lib/i18n"; // nếu cần i18n

type TxApiItem = {
  id: string;
  transaction_type: "earn" | "burn" | string;
  description?: string | null;
  transaction_source?: string | null;
  transaction_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user?: { user_number?: string | null; first_name?: string | null; last_name?: string | null } | null;
  status?: string | null;           // processed | rejected | ...
  points_used?: number | null;      // dương khi earn, âm khi burn (theo API hiện tại)
  points_used_at?: string | null;
  reason?: string | null;
};

type TxRow = {
  id: string;
  memberNo: string;
  date: string;
  description: string;
  status: string;
  points: number;            // dương: +, âm: -
};

export default function AdminDirectMileagePage() {
  // const { t, locale } = useTranslation();
  const locale = "vi"; // nếu dùng i18n, thay bằng từ hook

  // --------- Form state ----------
  const [memberNo, setMemberNo] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [type, setType] = useState<"flight" | "purchase" | "other">("flight");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);

  // --------- Transactions list ----------
  const [tx, setTx] = useState<TxRow[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const df = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [locale]
  );

  // ----- Summary box -----
  const summary = useMemo(() => {
    const pts = typeof points === "number" && !Number.isNaN(points) ? points : 0;
    return {
      member: memberNo.trim() || "—",
      miles: pts,
      type,
    };
  }, [memberNo, points, type]);

  // ===== Submit direct mileage =====
  async function handleSubmit() {
    setSubmitMsg(null);
    setSubmitErr(null);

    // basic validation
    if (!memberNo.trim()) return setSubmitErr("Member ID / user_number is required.");
    if (points === "" || Number.isNaN(Number(points)) || Number(points) <= 0)
      return setSubmitErr("Points must be a positive number.");
    if (!type) return setSubmitErr("Transaction type is required.");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const body = {
        points: Number(points),
        description: notes?.trim() || undefined,
        request_type: type,
        user_number: memberNo.trim(),
      };

      const res = await callApi<any>({
        method: "POST",
        path: "/ms-loyalty/admin/direct-mileage",
        body,
        headers: { Authorization: `Bearer ${token}` , 'x-user-id': localStorage.getItem("user_id") || ""  },
      });

      const awarded = res?.data?.data?.points_awarded;
      setSubmitMsg(
        typeof awarded === "number"
          ? `Success. Points awarded: +${awarded.toLocaleString()}`
          : "Success."
      );

      // refresh recent transactions (về trang 1 để thấy record mới)
      setPage(1);
      await fetchTransactions(1, size);

      // optional: reset form
      // setMemberNo("");
      // setPoints("");
      // setNotes("");
      // setType("flight");
    } catch (e: any) {
      setSubmitErr(e?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setMemberNo("");
    setPoints("");
    setType("flight");
    setNotes("");
    setSubmitErr(null);
    setSubmitMsg(null);
  }

  // ===== Fetch transactions list =====
  async function fetchTransactions(p = page, s = size) {
  setLoadingTx(true);
  try {
    const token = localStorage.getItem("token") || "";
    const res = await callApi<any>({
      method: "GET",
      path: `/ms-reward/admin/transactions?page=${p}&size=${s}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    // payload là đáp án server
    const payload = res?.data;               // { success, data, timestamp }
    const layer1 = payload?.data;            // có thể là { data: [...], pagination } HOẶC { data: { data: [...], pagination } }

    // Tìm mảng items một cách an toàn:
    const listRaw =
      Array.isArray(layer1?.data)             // dạng A: { data: [...] }
        ? layer1.data
        : Array.isArray(layer1)               // phòng khi API trả thẳng mảng
        ? layer1
        : Array.isArray(layer1?.data?.data)   // dạng B: { data: { data: [...] } }
        ? layer1.data.data
        : [];

    // Lấy pagination an toàn:
    const pg =
      layer1?.pagination ??
      layer1?.data?.pagination ??
      { total: listRaw.length, page: p, size: s, totalPages: 1 };

    // Map về UI
    const mapped: TxRow[] = listRaw.map((it: TxApiItem) => {
      const dateIso = it.transaction_date || it.created_at || "";
      const date = dateIso ? df.format(new Date(dateIso)) : "";
      const memberNo = it.user?.user_number || "";
      // API dùng points_used cho transaction (earn/burn). Dự phòng thêm các key khác nếu BE đổi tên:
      const rawPoints = (it.points_used ?? (it as any).points_awarded ?? (it as any).points ?? 0) as number;

      return {
        id: it.id,
        memberNo,
        date,
        description: it.description || it.reason || "",
        status: (it.status || "").toLowerCase(),
        points: Number(rawPoints) || 0,
      };
    });

    setTx(mapped);
    setTotal(Number(pg.total || mapped.length));
    setTotalPages(Number(pg.totalPages || 1));
    setPage(Number(pg.page || p));
    setSize(Number(pg.size || s));
  } catch (e) {
    setTx([]);
    setTotal(0);
    setTotalPages(1);
  } finally {
    setLoadingTx(false);
  }
}

  useEffect(() => {
    fetchTransactions(page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // ====== Render ======
  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h1 className="text-2xl mb-1">Record manual mileage credit</h1>
        <p className="text-gray-600">Add bonus miles to a member manually</p>
      </div>

      {/* Form */}
      <Card className="mb-6 max-w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transaction details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Member ID *</label>
              <Input
                placeholder="LM-106751 / C7X-NBA-QTF"
                value={memberNo}
                onChange={(e) => setMemberNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Miles to add *</label>
              <Input
                type="number"
                min={1}
                placeholder="100"
                value={points}
                onChange={(e) => setPoints(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Transaction type *</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "flight" | "purchase" | "other")
                }
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="car_rental">Car rental</option>
                <option value="purchase">Purchase</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <Textarea
              placeholder="This note will show up in the member's activity history"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[90px]"
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-blue-50 text-blue-900 p-4 text-sm">
            <p className="font-medium mb-1">Summary</p>
            <p>Member: <span className="font-medium">{summary.member}</span></p>
            <p>Miles: <span className="font-medium">+{summary.miles.toLocaleString()}</span></p>
            <p>Type: <span className="font-medium capitalize">{summary.type}</span></p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save transaction
            </Button>
            <Button variant="outline" onClick={handleReset}>Reset</Button>

            {submitMsg && <span className="text-green-700 text-sm">{submitMsg}</span>}
            {submitErr && <span className="text-red-600 text-sm">{submitErr}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="max-w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {loadingTx ? (
            <div className="p-4 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <ul className="divide-y">
                {tx.map((row) => {
                  const isPositive = row.points >= 0;
                  return (
                    <li key={row.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {row.memberNo || "—"}
                          <span className="ml-2 text-xs text-gray-500">{row.status}</span>
                        </p>
                        <p className="text-xs text-gray-500 truncate">{row.description}</p>
                        <p className="text-xs text-gray-400">{row.date}</p>
                      </div>
                      <div className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}
                        {Math.abs(row.points).toLocaleString()}
                      </div>
                    </li>
                  );
                })}
                {tx.length === 0 && (
                  <li className="py-6 text-center text-sm text-muted-foreground">
                    No transactions.
                  </li>
                )}
              </ul>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-600">
                  {total ? `Showing ${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}` : "—"}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>

                  <select
                    className="ml-2 rounded-md border border-gray-300 p-2 text-sm"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value) || 10)}
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
