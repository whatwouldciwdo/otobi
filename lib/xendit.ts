import Xendit from "xendit-node";

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export const { Invoice } = xendit;
export default xendit;
