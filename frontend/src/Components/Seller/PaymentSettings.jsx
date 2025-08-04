import React, { useState } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import {
  CreditCard,
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Building2,
  Percent,
  RefreshCw,
  Shield,
} from "lucide-react";
import SellerLayout from "./SellerLayout";

const PaymentMethodCard = ({ title, description, icon, isConnected = false, onConnect }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{title}</h3>
            {isConnected ? (
              <span className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Connected
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            className="mt-3"
            onClick={onConnect}
          >
            {isConnected ? "Manage" : "Connect"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    stripe: true,
    paypal: true,
    bankTransfer: false,
    applePay: false,
    googlePay: false,
  });

  const [payoutSettings, setPayoutSettings] = useState({
    method: "bankAccount",
    frequency: "monthly",
    minimumAmount: "100",
  });

  const handlePaymentMethodToggle = (method) => {
    setPaymentMethods({
      ...paymentMethods,
      [method]: !paymentMethods[method],
    });
  };

  const handlePayoutSettingChange = (setting, value) => {
    setPayoutSettings({
      ...payoutSettings,
      [setting]: value,
    });
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your payment methods, transaction fees, and payout preferences.
          </p>
        </div>

        <Tabs defaultValue="methods">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <Building2 className="h-4 w-4 mr-2" />
              Payout Settings
            </TabsTrigger>
            <TabsTrigger value="fees">
              <Percent className="h-4 w-4 mr-2" />
              Fees & Taxes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <PaymentMethodCard
                title="Stripe"
                description="Accept credit card payments directly on your store"
                icon={<CreditCard className="h-6 w-6 text-primary" />}
                isConnected={paymentMethods.stripe}
                onConnect={() => handlePaymentMethodToggle("stripe")}
              />

              <PaymentMethodCard
                title="PayPal"
                description="Allow customers to pay with their PayPal account"
                icon={<Wallet className="h-6 w-6 text-primary" />}
                isConnected={paymentMethods.paypal}
                onConnect={() => handlePaymentMethodToggle("paypal")}
              />

              <PaymentMethodCard
                title="Bank Transfer"
                description="Accept direct bank transfers from customers"
                icon={<Building2 className="h-6 w-6 text-primary" />}
                isConnected={paymentMethods.bankTransfer}
                onConnect={() => handlePaymentMethodToggle("bankTransfer")}
              />

              <PaymentMethodCard
                title="Apple Pay"
                description="Enable quick checkout with Apple Pay"
                icon={<Wallet className="h-6 w-6 text-primary" />}
                isConnected={paymentMethods.applePay}
                onConnect={() => handlePaymentMethodToggle("applePay")}
              />

              <PaymentMethodCard
                title="Google Pay"
                description="Enable quick checkout with Google Pay"
                icon={<Wallet className="h-6 w-6 text-primary" />}
                isConnected={paymentMethods.googlePay}
                onConnect={() => handlePaymentMethodToggle("googlePay")}
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                Adding multiple payment methods can increase your conversion rate by up to 30%.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4 pt-4">
            <Card className="p-6 space-y-6">
              {/* Payout Method */}
              <div>
                <h3 className="text-lg font-medium mb-4">Payout Method</h3>
                <RadioGroup
                  value={payoutSettings.method}
                  onValueChange={(value) =>
                    handlePayoutSettingChange("method", value)
                  }
                  className="space-y-3"
                >
                  {[
                    {
                      value: "bankAccount",
                      label: "Bank Account (ACH)",
                      desc: "Direct deposit to your bank account (2-3 business days)",
                    },
                    {
                      value: "paypal",
                      label: "PayPal",
                      desc: "Instant transfer to your PayPal account (fees may apply)",
                    },
                    {
                      value: "check",
                      label: "Check by Mail",
                      desc: "Physical check sent to your address (7-10 business days)",
                    },
                  ].map((option) => (
                    <div className="flex items-start space-x-2" key={option.value}>
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Payout Frequency */}
              <div>
                <h3 className="text-lg font-medium mb-4">Payout Schedule</h3>
                <RadioGroup
                  value={payoutSettings.frequency}
                  onValueChange={(value) =>
                    handlePayoutSettingChange("frequency", value)
                  }
                  className="space-y-3"
                >
                  {[
                    {
                      value: "daily",
                      label: "Daily",
                      desc: "Receive payouts every day (minimum balance required)",
                    },
                    {
                      value: "weekly",
                      label: "Weekly",
                      desc: "Receive payouts every Monday",
                    },
                    {
                      value: "monthly",
                      label: "Monthly",
                      desc: "Receive payouts on the 1st of each month",
                    },
                  ].map((option) => (
                    <div className="flex items-start space-x-2" key={option.value}>
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Minimum Amount */}
              <div>
                <h3 className="text-lg font-medium mb-4">Minimum Payout Amount</h3>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    value={payoutSettings.minimumAmount}
                    onChange={(e) =>
                      handlePayoutSettingChange("minimumAmount", e.target.value)
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">
                    Minimum balance required for payout
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Payout Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-4 pt-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Platform Fees</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Transaction Fee",
                    desc: "Fee charged on each sale",
                    value: "3.5% + $0.30",
                  },
                  {
                    title: "Subscription Fee",
                    desc: "Monthly fee for your seller account",
                    value: "$15.00/month",
                  },
                  {
                    title: "Promotional Discount",
                    desc: "Current promotion applied to your account",
                    value: "-$5.00/month",
                    highlight: true,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex justify-between items-center pb-2 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <p className={`font-medium ${item.highlight ? "text-green-600" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2">
                  <p className="font-medium">Total Monthly Fee</p>
                  <p className="font-bold">$10.00/month</p>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-medium mb-4">Tax Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="collectTax">Collect Sales Tax</Label>
                  <Switch id="collectTax" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="automaticTax">Automatic Tax Calculation</Label>
                  <Switch id="automaticTax" defaultChecked />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Update Tax Settings
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  );
};

export default PaymentSettings;
