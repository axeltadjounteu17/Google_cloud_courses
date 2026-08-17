import React, { useEffect, useState } from "react";

const ROUTES = {
  course: /^course\/(\d+)$/,
  lesson: /^lesson\/(\d+)\/(\d+)$/,
  slides: /^slides\/(\d+)$/,
  slide: /^slide\/(\d+)\/([^/]+)\/(\d+)$/,
  courses: /^courses$/,
  search: /^search$/,
  progress: /^progress$/,
  settings: /^settings$/,
};

function parse(hash) {
  const path = hash.replace(/^#\/?/, "").replace(/\?.*$/, "") || "home";
  for (const [page, re] of Object.entries(ROUTES)) {
    const m = path.match(re);
    if (m) return { page, params: m.slice(1) };
  }
  return { page: "home", params: [] };
}

export function useRoute() {
  const [hash, setHash] = useState(() => location.hash || "#/home");

  useEffect(() => {
    const onChange = () => {
      setHash(location.hash || "#/home");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return { ...parse(hash), hash };
}

export function Link({ href, className = "", children, onClick, ...rest }) {
  return (
    <a href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
