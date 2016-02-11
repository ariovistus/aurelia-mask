System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  typescriptOptions: {
    "module": "system",
    "typeCheck": true,
    "tsconfig": true,
    "resolveTypings": true
  },
  paths: {
    "npm:*": "jspm_packages/npm/*",
    "github:*": "jspm_packages/github/*",
    "tsconfig.json": "src/tsconfig.json"
  },

  packages: {
    "/src": {
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "ts"
        }
      }
    },
    "/tests": {
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "ts"
        }
      }
    }
  },

  map: {
    "ts": "github:frankwallis/plugin-typescript@2.5.1",
    "typescript": "npm:typescript@1.7.5",
    "github:frankwallis/plugin-typescript@2.5.1": {
      "typescript": "npm:typescript@1.7.5"
    }
  }
});
