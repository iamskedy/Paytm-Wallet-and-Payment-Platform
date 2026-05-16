import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect } from "react";

const balanceAtom = atom<number>({ key: "balance", default: 0 });

export function useBalance() {
  const setBalance = useSetRecoilState(balanceAtom);
  const balance = useRecoilValue(balanceAtom);

  useEffect(() => {
    fetch("/api/balance")
      .then(r => r.json())
      .then(data => setBalance(data.amount ?? 0));
  }, []);

  return balance;
}