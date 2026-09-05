import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const ignoredAssets = path.join(dist, "assets", "node_modules");
const generatedFonts = path.join(
  ignoredAssets,
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts",
);
const publishedAssets = path.join(dist, "assets", "fonts");

await rm(publishedAssets, { recursive: true, force: true });
await mkdir(publishedAssets, { recursive: true });
for (const font of await readdir(generatedFonts)) {
  if (font.endsWith(".ttf")) {
    await cp(path.join(generatedFonts, font), path.join(publishedAssets, font));
  }
}

const rewriteBundles = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteBundles(file);
    } else if (entry.name.endsWith(".js")) {
      const source = await readFile(file, "utf8");
      await writeFile(
        file,
        source.replaceAll(
          "assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts",
          "assets/fonts",
        ),
      );
    }
  }
};

await rewriteBundles(path.join(dist, "_expo"));
const webBundleDirectory = path.join(dist, "_expo", "static", "js", "web");
let html = await readFile(path.join(dist, "index.html"), "utf8");
for (const file of await readdir(webBundleDirectory)) {
  if (file.endsWith(".js")) {
    const deployedName = file.replace(/\.js$/, ".pages.js");
    await cp(
      path.join(webBundleDirectory, file),
      path.join(webBundleDirectory, deployedName),
    );
    html = html.replaceAll(file, deployedName);
  }
}
await writeFile(path.join(dist, "index.html"), html);
await rm(ignoredAssets, { recursive: true, force: true });
console.log("Prepared icon fonts for GitHub Pages.");
