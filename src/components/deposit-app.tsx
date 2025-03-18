"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, ScrollText, Info, Bookmark } from "lucide-react"
import Image from "next/image"
import DepositAnimation from "./deposit-animation"
import CountdownTimer from "./countdown-timer"
import { useAccount, useReadContracts, useSendTransaction, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { depositAbi } from "@/lib/abi/deposit"
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from "viem"
import { truncateAddress } from "@/lib/truncateAddress"
import sdk from "@farcaster/frame-sdk";
import { toast } from "sonner"

export default function DepositApp() {
    const { address } = useAccount()

    const [activeTab, setActiveTab] = useState("deposit")
    const [showAnimation, setShowAnimation] = useState(false)
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
    const [isFrameAdded, setIsFrameAdded] = useState(false);
    const chainId = useChainId()
    const { sendTransaction, error: sendTxError, isError: isSendTxError } = useSendTransaction();

    // Watch for errors and show toast
    useEffect(() => {
        if (isSendTxError && sendTxError) {
            toast.error(sendTxError.message, {
                description: "Please try again",
                duration: 4000,
            })
        }
    }, [isSendTxError, sendTxError])

    // Watch for deposit transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash as `0x${string}`,
    });

    // Watch for approval transaction confirmation
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
        hash: approvalTxHash as `0x${string}`,
    });

    // Contract read configuration - memoized to prevent unnecessary re-renders
    const contractConfig = useMemo(() => ({
        contracts: [
            {
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
                abi: depositAbi,
                functionName: "totalDeposited",
            },
            {
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
                abi: depositAbi,
                functionName: "gameEndTime",
            },
            {
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
                abi: depositAbi,
                functionName: "currentLeader",
            },
            {
                address: process.env.NEXT_PUBLIC_ERC20_ADDRESS as `0x${string}`,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`],
            },
            ...(address ? [
                {
                    address: process.env.NEXT_PUBLIC_ERC20_ADDRESS as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "allowance",
                    args: [address as `0x${string}`, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`],
                },
                {
                    address: process.env.NEXT_PUBLIC_ERC20_ADDRESS as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [address as `0x${string}`],
                }
            ] : [])
        ],
        // Only include user-specific contracts when we have an address
    }), [address]);

    // Use the memoized configuration for contract reads - only run when component is mounted
    const { data, isLoading, isError, refetch } = useReadContracts(
        contractConfig
    );

    // Memoize the processed contract data to prevent unnecessary re-renders
    const {
        totalDeposited,
        endTime,
        lastDepositor,
        contractBalance,
        allowance,
        balance
    } = useMemo(() => {
        // Default values
        const result = {
            totalDeposited: '0',
            endTime: 0,
            lastDepositor: '0x0000000000000000000000000000000000000000',
            contractBalance: '0',
            allowance: 0,
            balance: '0'
        };

        if (!data) return result;

        // Process totalDeposited
        if (data[0]?.status === 'success' && data[0]?.result !== undefined) {
            result.totalDeposited = formatUnits(data[0].result as bigint, 6);
        }

        // Process gameEndTime
        if (data[1]?.status === 'success' && data[1]?.result !== undefined) {
            result.endTime = Number(data[1].result) * 1000;
        }

        // Process currentLeader
        if (data[2]?.status === 'success' && data[2]?.result !== undefined) {
            result.lastDepositor = data[2].result as `0x${string}`;
        }

        // Process contract balance
        if (data[3]?.status === 'success' && data[3]?.result !== undefined) {
            result.contractBalance = formatUnits(data[3].result as bigint, 6);
        }

        // Process allowance and balance only if we have an address
        if (address) {
            if (data[4]?.status === 'success' && data[4]?.result !== undefined) {
                result.allowance = Number(formatUnits(data[4].result as bigint, 6));
            }

            if (data[5]?.status === 'success' && data[5]?.result !== undefined) {
                result.balance = formatUnits(data[5].result as bigint, 6);
            }
        }

        return result;
    }, [data, address]);

    // Load SDK only on client-side
    useEffect(() => {

        const loadSDK = async () => {
            try {
                // Import SDK dynamically to avoid SSR issues
                setIsSDKLoaded(true);

                // Only call ready() after data is loaded
                sdk.actions.ready();
            } catch (error) {
                console.error("Error initializing SDK:", error);
            }
        };

        if (!isSDKLoaded) {
            loadSDK();
        }
    }, [isSDKLoaded]);

    // Handle successful deposit transaction
    useEffect(() => {
        if (isConfirmed) {
            setShowAnimation(true);
            refetch();

            // Reset animation after a delay
            const timer = setTimeout(() => {
                setShowAnimation(false);
                setTxHash(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isConfirmed, refetch]);

    // Handle successful approval transaction
    useEffect(() => {

        if (isApprovalConfirmed) {
            refetch();
            // Clear approval transaction hash after confirmation
            setApprovalTxHash(null);
        }
    }, [isApprovalConfirmed, refetch]);

    // Auto-refresh data every 30 seconds - only when mounted
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 10000);

        return () => clearInterval(interval);
    }, [refetch]);

    // Check if frame is already added
    useEffect(() => {
        const checkFrameStatus = async () => {
            try {
                const context = await sdk.context;
                if (context?.client?.added) {
                    setIsFrameAdded(true);
                }
            } catch (error) {
                console.error("Failed to check frame status:", error);
            }
        };

        checkFrameStatus();
    }, []);

    const handleBookmark = async () => {
        try {
            await sdk.actions.addFrame();
            setIsFrameAdded(true);
            toast.success("Frame bookmarked!", {
                description: "You can now easily access Time Tomb anytime",
            });
        } catch (error) {
            console.error("Failed to bookmark:", error);
            toast.error("Failed to bookmark", {
                description: "Please try again",
            });
        }
    };

    // Memoize transaction handlers to prevent unnecessary recreations
    const handleAllowance = () => {
        const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
                BigInt(parseUnits("1000000000", 6)),
            ],
        });
        sendTransaction({
            to: process.env.NEXT_PUBLIC_ERC20_ADDRESS as `0x${string}`,
            data,
            value: BigInt(0),
        }, {
            onSuccess: (hash) => {
                setApprovalTxHash(hash);
            },
        });
    }

    const handleDeposit = useCallback(() => {
        const data = encodeFunctionData({
            abi: depositAbi,
            functionName: "deposit",
            args: [],
        });

        sendTransaction({
            to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
            data,
            value: BigInt(0),
        }, {
            onSuccess: (data) => {
                setTxHash(data);
            }
        });
    }, [sendTransaction]);

    return (
        <div className="w-full max-w-md mx-auto relative">
            <AnimatePresence>{showAnimation && <DepositAnimation />}</AnimatePresence>
            <Card className="border-0 bg-gradient-to-b from-zinc-900 to-black text-white shadow-[0_0_15px_rgba(255,64,0,0.15)]">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="Time Tomb Logo"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF4000] to-[#FD9D00]">
                                Time Tomb
                            </span>
                        </CardTitle>
                        {!isFrameAdded && (
                            <Button
                                onClick={handleBookmark}
                                className="bg-gradient-to-r from-[#FF4000] to-[#FD9D00] hover:from-[#E53900] hover:to-[#E89000] text-white shadow-lg shadow-[#FF4000]/20 transition-all hover:shadow-[#FF4000]/40 hover:scale-[1.02] font-medium"
                            >
                                <Bookmark className="h-4 w-4" />
                                Save
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
                            <TabsTrigger value="deposit" className="data-[state=active]:bg-zinc-700">
                                Deposit
                            </TabsTrigger>
                            <TabsTrigger value="rules" className="data-[state=active]:bg-zinc-700">
                                Rules
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit" className="space-y-6 mt-6">
                            {/* Countdown Timer */}
                            <CountdownTimer endTime={endTime} />

                            {/* Total Deposited */}
                            <div className="text-center py-6">
                                <p className="text-zinc-400 text-sm mb-1">Total Deposited</p>
                                <h2 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF4000] via-[#FF7300] to-[#FD9D00]">
                                    ${totalDeposited}
                                </h2>
                            </div>

                            {/* Error States */}

                            {isError && (
                                <div className="text-center py-2">
                                    <p className="text-red-400">Error loading contract data. Please refresh.</p>
                                </div>
                            )}

                            {/* Deposit Button */}
                            <div className="pt-4">
                                {!address && (
                                    <Button
                                        disabled
                                        className="w-full py-6 text-lg font-bold bg-zinc-700 text-zinc-400"
                                    >
                                        Connect Wallet to Deposit
                                    </Button>
                                )}
                                {address && allowance > 0 && Number(balance) > 0 && (
                                    <Button
                                        onClick={handleDeposit}
                                        disabled={isConfirming || isApprovalConfirming}
                                        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#FF4000] to-[#FD9D00] hover:from-[#E53900] hover:to-[#E89000] text-white shadow-lg shadow-[#FF4000]/20 transition-all hover:shadow-[#FF4000]/40 hover:scale-[1.02]"
                                    >
                                        {isConfirming ? 'Confirming Deposit...' : 'Deposit 1 USDC'}
                                    </Button>
                                )}
                                {address && endTime > 0 && allowance < 1 && Number(balance) > 0 && (
                                    <Button
                                        onClick={handleAllowance}
                                        disabled={isApprovalConfirming || isConfirming}
                                        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#FF4000] to-[#FD9D00] hover:from-[#E53900] hover:to-[#E89000] text-white shadow-lg shadow-[#FF4000]/20 transition-all hover:shadow-[#FF4000]/40 hover:scale-[1.02]"
                                    >
                                        {isApprovalConfirming ? 'Confirming Allowance...' : 'Approve USDC'}
                                    </Button>
                                )}
                                {address && endTime > 0 && Number(balance) <= 0 && (
                                    <Button
                                        disabled
                                        className="w-full py-6 text-lg font-bold bg-zinc-700 text-zinc-400"
                                    >
                                        Insufficient USDC Balance
                                    </Button>
                                )}
                                {isConfirmed && (
                                <div className="bg-zinc-800/50 rounded-xl p-4">
                                    <p className="text-zinc-400 text-xs mb-2 flex items-center gap-1">
                                         <Button
                                         onClick={() => {
                                            sdk.actions.openUrl(`https://warpcast.com/~/compose?text=Hello%20world!`)
                                        }}
                                        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#FF4000] to-[#FD9D00] hover:from-[#E53900] hover:to-[#E89000] text-white shadow-lg shadow-[#FF4000]/20 transition-all hover:shadow-[#FF4000]/40 hover:scale-[1.02]"
                                        >share</Button>
                                    </p>
                                </div>
                            )}
                            </div>

                            {/* Last Depositor */}
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                                <p className="text-zinc-400 text-xs mb-2 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Current Leader
                                </p>
                                <div className="flex items-center gap-3">
                                    <div>
                                        {lastDepositor !== address ? <p className="font-medium">{truncateAddress(lastDepositor)}</p> : <p className="font-medium">You are the leader!</p>}
                                    </div>
                                </div>
                            </div>
                            
                        </TabsContent>

                        <TabsContent value="rules" className="space-y-4 mt-6">
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <ScrollText className="h-5 w-5 text-[#FF4000]" />
                                    The Time Tomb
                                </h3>

                                <div className="space-y-4 text-sm">
                                    <p className="text-[#FD9D00] font-bold">Time is Money – A Social Experiment</p>

                                    <ol className="space-y-4 text-zinc-300 list-decimal pl-4">
                                        <li>
                                            Deposit 1 USDC into the time tomb → You become the leader.
                                        </li>
                                        <li>
                                            The first deposit starts a timer of 3 days, subsequent deposits extend the timer by 5 minutes.
                                        </li>
                                        <li>
                                            When the timer hits 0 minutes and 0 seconds, the final leader is decided. They can withdraw all deposits that accumulated in the time tomb.
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            <div className="bg-[#FF4000]/10 border border-[#FF4000]/20 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-[#FF4000] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-zinc-300">
                                        <span className="font-bold text-[#FD9D00]">Pro Tip:</span> Watch the timer closely as it approaches zero. Timing your deposit strategically can make you the final leader!
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="pt-0 text-center text-xs text-zinc-500">
                    <p className="w-full">Powered by The Time Tomb • Network: {chainId}</p>
                </CardFooter>
            </Card>
        </div>
    )
}

