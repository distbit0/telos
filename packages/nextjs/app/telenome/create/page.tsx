"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Address, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Placeholder UI components
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="input input-bordered w-full" />
);

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className="label">
    <span className="label-text">{props.children}</span>
  </label>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="select select-bordered w-full">
    {props.children}
  </select>
);

// Define the Zod schema for form validation
const formSchema = z.object({
  template: z.string().min(1, "Template is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  outcomes: z.string().min(1, "Outcomes are required (comma-separated)"),
});

type FormValues = z.infer<typeof formSchema>;

// Define the structure for market creation parameters based on MarketFactory ABI
// This type should now exactly match the MarketFactory.CreateMarketParams struct for createCategoricalMarket
interface CreateMarketParamsType {
  marketName: string; // 1
  outcomes: string[]; // 2
  questionStart: string; // 3
  questionEnd: string; // 4
  outcomeType: string; // 5
  parentOutcome: bigint; // 6
  parentMarket: Address; // 7
  category: string; // 8
  lang: string; // 9
  lowerBound: bigint; // 10
  upperBound: bigint; // 11
  minBond: bigint; // 12
  openingTime: number; // 13 (ABI: uint32)
  tokenNames: string[]; // 14 (ABI: string[])
}

const CreateMarketPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "MarketFactory" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template: "",
      subject: "",
      description: "",
      outcomes: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (!connectedAddress) {
      toast.error("Please connect your wallet.");
      return;
    }

    const loadingToastId = toast.loading("Preparing market creation...");

    try {
      const outcomesArray = data.outcomes
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (outcomesArray.length < 2) {
        toast.error("Please provide at least two outcomes.", { id: loadingToastId });
        return;
      }

      // This object now strictly follows CreateMarketParamsType which matches the ABI struct order
      const marketParams: CreateMarketParamsType = {
        marketName: data.subject,
        outcomes: outcomesArray,
        questionStart: Math.floor(Date.now() / 1000).toString(),
        questionEnd: (Math.floor(Date.now() / 1000) + 86400 * 7).toString(), // 7 days later
        outcomeType: "categorical",
        parentOutcome: 0n,
        parentMarket: zeroAddress,
        category: "Default Category",
        lang: "en",
        lowerBound: 0n,
        upperBound: 0n,
        minBond: BigInt(1e17), // 0.1 ETH or equivalent
        openingTime: Math.floor(Date.now() / 1000), // Current time (as number for uint32)
        tokenNames: outcomesArray.map(o => o.substring(0, 32)), // Example: use outcomes, truncated if needed
      };

      console.log("Calling createCategoricalMarket with params (as object):", marketParams);
      console.log("Calling createCategoricalMarket with params (as tuple for ABI):", [
        marketParams.marketName,
        marketParams.outcomes,
        marketParams.questionStart,
        marketParams.questionEnd,
        marketParams.outcomeType,
        marketParams.parentOutcome,
        marketParams.parentMarket,
        marketParams.category,
        marketParams.lang,
        marketParams.lowerBound,
        marketParams.upperBound,
        marketParams.minBond,
        marketParams.openingTime,
        marketParams.tokenNames,
      ]);

      setIsSubmitting(true);
      await writeContractAsync({
        functionName: "createCategoricalMarket",
        args: [marketParams],
      });

      toast.success("Market creation transaction submitted successfully!", { id: loadingToastId });
      reset();
    } catch (e: any) {
      console.error("Error creating market:", e);
      toast.error(`Error creating market: ${e.shortMessage || e.message || "Unknown error"}`, {
        id: loadingToastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-center">Create New Telenome Market</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg mx-auto p-4 shadow-lg rounded-lg bg-base-100"
      >
        <div>
          <Label htmlFor="template">Template</Label>
          <Select id="template" {...register("template")}>
            <option value="">Select a template</option>
            <option value="binary_choice">Binary Choice</option>
            <option value="multiple_choice">Multiple Choice</option>
          </Select>
          {errors.template && <p className="text-red-500 text-sm">{errors.template.message}</p>}
        </div>

        <div>
          <Label htmlFor="subject">Subject / Question</Label>
          <Input id="subject" type="text" {...register("subject")} placeholder="e.g., Will X event happen by Y date?" />
          {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description / Context</Label>
          <textarea
            id="description"
            {...register("description")}
            className="textarea textarea-bordered w-full"
            placeholder="Provide additional context or details for the market."
            rows={3}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <Label htmlFor="outcomes">Outcomes (comma-separated)</Label>
          <Input
            id="outcomes"
            type="text"
            {...register("outcomes")}
            placeholder="e.g., Yes, No OR Option A, Option B, Option C"
          />
          {errors.outcomes && <p className="text-red-500 text-sm">{errors.outcomes.message}</p>}
        </div>

        <div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Creating Market...
              </>
            ) : (
              "Create Market"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMarketPage;
