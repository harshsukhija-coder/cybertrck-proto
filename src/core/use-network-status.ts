import { useCallback, useEffect, useRef, useState } from "react";

const TEST_BYTES = 2_000_000;
const TEST_INTERVAL_MS = 120_000;
const SPEED_TEST_URL = `https://speed.cloudflare.com/__down?bytes=${TEST_BYTES}`;

// Browsers don't expose the real private IP, so the machine gets one from the story's office network
const assignPrivateIp = () => `192.168.1.${10 + Math.floor(Math.random() * 240)}`;

export const useNetworkStatus = () => {
  const [privateIp] = useState(assignPrivateIp);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [mbps, setMbps] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const runSpeedTest = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setTesting(true);
    try {
      const start = performance.now();
      const response = await fetch(`${SPEED_TEST_URL}&t=${Date.now()}`, { cache: "no-store", signal: current.signal });
      await response.arrayBuffer();
      const seconds = (performance.now() - start) / 1000;
      setMbps((TEST_BYTES * 8) / seconds / 1_000_000);
    } catch {
      if (!current.signal.aborted) setMbps(null);
    } finally {
      if (!current.signal.aborted) setTesting(false);
    }
  }, []);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const first = window.setTimeout(runSpeedTest, 0);
    const timer = window.setInterval(runSpeedTest, TEST_INTERVAL_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      controller.current?.abort();
    };
  }, [runSpeedTest]);

  return { privateIp, online, mbps, testing, runSpeedTest };
};
