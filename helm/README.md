Before applying this Helm chart create the Secret called "<chart_name>-db-secret" with the following content (replace variables in the <> brackets):
```
apiVersion: v1
kind: Secret
metadata:
  name: <chart_name>-db-secret
type: Opaque
stringData:
  dbUsername: <strongUser>
  dbPassword: <strongPassword>
```
