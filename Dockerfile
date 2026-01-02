# Etapa 1: Build
FROM node:20-alpine AS build-stage

# Setăm directorul de lucru
WORKDIR /app

# Copiem fișierele de dependințe
COPY package*.json ./

# Instalăm dependințele
RUN npm install

# Copiem restul codului sursă
COPY . .

# Generăm folderul /dist (build-ul de producție)
RUN npm run build

# Etapa 2: Producție (Nginx)
FROM nginx:stable-alpine AS production-stage

# Copiem fișierele build-uite din prima etapă în folderul Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiem configurația custom de Nginx (cea cu try_files)
# Aceasta suprascrie configurația default a imaginii
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expunem portul 80 (interiorul containerului)
EXPOSE 80

# Pornim Nginx
CMD ["nginx", "-g", "daemon off;"]