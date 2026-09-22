import { AnyRecord, cardClass, inputClass, api } from "./shared";
import { toast } from "sonner";

export function OrdersTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const remove = async (o: any) => {
    if (!window.confirm(`Permanently delete unpaid order ${o.orderNumber}? This cannot be undone.`)) return;
    try {
      const d = await api(`/api/admin/orders?id=${o.id}`, { method: "DELETE" });
      toast.success(d.message || "Order deleted.");
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete order.");
    }
  };
  return (
    <div className={cardClass}>
      <h2 className="text-xl font-black">Orders</h2>
      <p className="mt-1 text-sm text-black/50">
        Paid orders are preserved. SUPER_ADMIN can permanently delete unpaid pending or cancelled test orders.
      </p>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-black/50">No orders yet.</p>
        ) : (
          rows.map((o) => (
            <div key={o.id} className="rounded-xl border border-black/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <b>{o.orderNumber}</b>
                  <p className="text-sm text-black/60">
                    {o.customerName} · KES {String(o.total)} · {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={inputClass + " max-w-xs"}
                    value={o.status}
                    onChange={(e) => mutate(`/api/admin/orders?id=${o.id}`, "PATCH", { status: e.target.value })}
                  >
                    {["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      )
                    )}
                  </select>
                  {(!o.payments || !o.payments.some((p: any) => p.status === "SUCCESS")) &&
                    ["PENDING_PAYMENT", "CANCELLED"].includes(o.status) && (
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
                        onClick={() => remove(o)}
                      >
                        Delete
                      </button>
                    )}
                </div>
              </div>
              <p className="mt-2 text-xs text-black/50">
                {o.items?.map((i: any) => `${i.productName} ${i.size || ""} × ${i.quantity}`).join(" · ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
