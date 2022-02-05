FROM grafana/grafana:8.3.3

COPY entrypoint.sh init-public.sh /app/
COPY ./templates /app/templates

USER root
RUN chmod +x /app/*.sh \
    && apk --no-cache add curl jq

ENTRYPOINT [ "/app/entrypoint.sh" ]
