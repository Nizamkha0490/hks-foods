"use client";

import { useState, useEffect } from "react";
import { Save, Database, Lock, Download } from "lucide-react";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function Settings() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    warehouseName: "",
    address: "",
    city: "",
    postalCode: "",
    contactNumber: "",
    vatNumber: "",
    companyNumber: "",
  })
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await api.get("/settings/backup");
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hks-foods-backup-${new Date().toISOString().split("T")[0]
        }.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Backup created and downloaded successfully");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Error creating backup");
    }
  };

  const handlePasswordChangeRequest = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill all fields")
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match")
      return
    }
    setIsPasswordDialogOpen(false)
    setIsConfirmDialogOpen(true)
  }

  const handlePasswordChangeConfirm = async () => {
    setIsLoading(true);
    try {
      await api.post("/settings/change-password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      setIsConfirmDialogOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message || "Error changing password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-metallic mb-1">Settings</h1>
        <p className="text-kf-text-mid">Manage warehouse and system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-kf-border card-shadow">
          <h2 className="text-xl font-bold text-kf-text-light mb-4">Warehouse Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse-name" className="text-kf-text-mid">
                Warehouse Name
              </Label>
              <Input
                id="warehouse-name"
                value={settings.warehouseName}
                onChange={(e) => setSettings({ ...settings, warehouseName: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-kf-text-mid">
                Address
              </Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-kf-text-mid">
                City
              </Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code" className="text-kf-text-mid">
                Postal Code
              </Label>
              <Input
                id="postal-code"
                value={settings.postalCode}
                onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-kf-text-mid">
                Contact Number
              </Label>
              <Input
                id="contact"
                value={settings.contactNumber}
                onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat-number" className="text-kf-text-mid">
                VAT Number
              </Label>
              <Input
                id="vat-number"
                value={settings.vatNumber}
                onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-number" className="text-kf-text-mid">
                Company Number
              </Label>
              <Input
                id="company-number"
                value={settings.companyNumber}
                onChange={(e) => setSettings({ ...settings, companyNumber: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-card border-kf-border card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-kf-text-light">Security</h2>
            </div>
            <p className="text-sm text-kf-text-mid mb-4">
              This is a shared account system. All team members use the same credentials.
            </p>
            <Button
              variant="outline"
              className="w-full border-kf-border bg-transparent"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              Change Shared Password
            </Button>
          </Card>

          <Card className="p-6 bg-card border-kf-border card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-kf-text-light">Data Management</h2>
            </div>
            <p className="text-sm text-kf-text-mid mb-4">
              Export all data for backup purposes. This will create a downloadable file with all products, orders,
              clients, and ledgers.
            </p>
            <Button
              onClick={handleBackup}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Data Backup"}
            </Button>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Change Shared Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-kf-text-mid">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-kf-text-mid">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-kf-text-mid">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <Button
              onClick={handlePasswordChangeRequest}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">
              Are you sure you want to change password?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              This will change the shared password for all team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordChangeConfirm}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Changing..." : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
