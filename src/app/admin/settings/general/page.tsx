
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your general application settings here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the general settings page. More options can be added here.</p>
      </CardContent>
    </Card>
  );
}
