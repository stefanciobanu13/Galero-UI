# ... (etapa de build: npm install, npm run build) ...

FROM nginx:stable-alpine
# Copiem fișierele build-uite
COPY --from=build-stage /app/dist /usr/share/nginx/html

# ADĂUGĂ ACEASTĂ LINIE:
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]