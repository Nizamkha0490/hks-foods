"use client";

import { useState, useEffect } from "react";
import { Save, Database, Lock, Download, Sparkles, Building2, User, Shield } from "lucide-react";
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

type SettingsSection = "ai" | "company" | "security" | "backup"

export default function Settings() {
    const [activeSection, setActiveSection] = useState<SettingsSection>("company")
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
        accountNumber: "",
        sortCode: "",
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

    const menuItems = [
        { id: "ai" as SettingsSection, label: "AI Assistant", icon: Sparkles },
        { id: "company" as SettingsSection, label: "Company Info", icon: Building2 },
        { id: "security" as SettingsSection, label: "Security", icon: Shield },
        { id: "backup" as SettingsSection, label: "Data Backup", icon: Database },
    ]

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-metallic mb-1">Settings</h1>
                <p className="text-kf-text-mid">System configuration and preferences</p>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <Card className="w-64 p-4 bg-card border-kf-border card-shadow h-fit">
                    <div className="space-y-1">
                        <div className="text-xs font-semibold text-kf-text-mid uppercase mb-3 px-3">
                            Intelligence
                        </div>
                        <button
                            onClick={() => setActiveSection("ai")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeSection === "ai"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-kf-text-mid hover:bg-muted"
                                }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">AI Assistant</span>
                        </button>

                        <div className="text-xs font-semibold text-kf-text-mid uppercase mb-3 px-3 mt-6">
                            Account
                        </div>
                        <button
                            onClick={() => setActiveSection("company")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeSection === "company"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-kf-text-mid hover:bg-muted"
                                }`}
                        >
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Company Info</span>
                        </button>

                        <div className="text-xs font-semibold text-kf-text-mid uppercase mb-3 px-3 mt-6">
                            System
                        </div>
                        <button
                            onClick={() => setActiveSection("security")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeSection === "security"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-kf-text-mid hover:bg-muted"
                                }`}
                        >
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">Security</span>
                        </button>
                        <button
                            onClick={() => setActiveSection("backup")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeSection === "backup"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-kf-text-mid hover:bg-muted"
                                }`}
                        >
                            <Database className="h-4 w-4" />
                            <span className="text-sm font-medium">Data Backup</span>
                        </button>
                    </div>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* AI Assistant Section */}
                    {activeSection === "ai" && (
                        <Card className="p-8 bg-card border-kf-border card-shadow">
                            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-kf-text-light mb-3">HKSFOODS AI Assistant</h2>
                                    <p className="text-kf-text-mid">
                                        Your intelligent CRM companion. Ask about sales trends, inventory alerts, or generate instant reports using natural language.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={() => toast.info("AI Assistant feature coming soon!")}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Launch Assistant
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Company Info Section */}
                    {activeSection === "company" && (
                        <Card className="p-6 bg-card border-kf-border card-shadow">
                            <h2 className="text-xl font-bold text-kf-text-light mb-6">Company Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="space-y-2">
                                    <Label htmlFor="account-number" className="text-kf-text-mid">
                                        Account Number
                                    </Label>
                                    <Input
                                        id="account-number"
                                        value={settings.accountNumber}
                                        onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                                        className="bg-muted border-kf-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sort-code" className="text-kf-text-mid">
                                        Sort Code
                                    </Label>
                                    <Input
                                        id="sort-code"
                                        value={settings.sortCode}
                                        onChange={(e) => setSettings({ ...settings, sortCode: e.target.value })}
                                        className="bg-muted border-kf-border"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </Card>
                    )}

                    {/* Security Section */}
                    {activeSection === "security" && (
                        <Card className="p-6 bg-card border-kf-border card-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold text-kf-text-light">Security</h2>
                            </div>
                            <p className="text-sm text-kf-text-mid mb-6">
                                This is a shared account system. All team members use the same credentials.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full border-kf-border bg-transparent"
                                onClick={() => setIsPasswordDialogOpen(true)}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Change Shared Password
                            </Button>
                        </Card>
                    )}

                    {/* Data Backup Section */}
                    {activeSection === "backup" && (
                        <Card className="p-6 bg-card border-kf-border card-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold text-kf-text-light">Data Backup</h2>
                            </div>
                            <p className="text-sm text-kf-text-mid mb-6">
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
                    )}
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
