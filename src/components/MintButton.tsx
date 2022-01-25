import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

import { fetchData } from "../redux/data/dataActions"
import { connectWallet } from "../redux/blockchain/blockchainActions"

const MintButton: React.FC<{ amount: number; loading: boolean }> = ({
	amount,
	loading,
}) => {
	const dispatch = useDispatch()
	const blockchain: any = useSelector((state: any) => state.blockchain)
	const data: any = useSelector((state: any) => state.data)

	const [CONFIG, SET_CONFIG] = useState({
		CONTRACT_ADDRESS: "",
		SCAN_LINK: "",
		NETWORK: {
			NAME: "",
			SYMBOL: "",
			ID: 0,
		},
		NFT_NAME: "",
		SYMBOL: "",
		MAX_SUPPLY: 1,
		WEI_COST: 0,
		DISPLAY_COST: 0,
		GAS_LIMIT: 0,
		MARKETPLACE: "",
		MARKETPLACE_LINK: "",
		SHOW_BACKGROUND: false,
	})

	const getData = () => {
		if (blockchain.account !== "" && blockchain.smartContract !== null) {
			dispatch(fetchData())
		}
	}

	const getConfig = async () => {
		const configResponse = await fetch("/config/config.json", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})
		const config = await configResponse.json()
		SET_CONFIG(config)
	}

	const mint = async () => {
		try {
			getData()
			const soldOut =
				parseInt(data.tokensMinted) === parseInt(data.totalSupply)
			if (!soldOut) {
				if (!data.salePaused && blockchain.account) {
					let cost = CONFIG.WEI_COST
					let gasLimit = CONFIG.GAS_LIMIT
					let totalCostWei = String(cost * amount)
					let totalGasLimit = String(gasLimit * amount)
					const receipt = await blockchain.smartContract.methods
						.mint(amount)
						.send({
							gasLimit: totalGasLimit,
							to: blockchain.smartContract._address,
							from: blockchain.account,
							value: totalCostWei,
						})
					alert(
						`Purchased ${amount} token(s)! It may take some time to show up on Opensea. Transaction: https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`
					)
					getData()
				} else if (!blockchain.account) {
					dispatch(connectWallet())
				}
			}
		} catch (err) {
			console.log(err)
		}
	}

	useEffect(() => {
		getConfig()
	}, [])

	return (
		<StyledButton
			onClick={(e) => {
				e.preventDefault()
				mint()
			}}
			disabled={loading}
		>
			<StyledText>{!loading ? "Mint" : "Loading"}</StyledText>
		</StyledButton>
	)
}

export default MintButton

const StyledButton = styled.button`
	border-radius: 10px;
	border: none;
	text-align: center;
	text-decoration: none;
	font-size: 12px;
	background-color: #61dbfb;
	padding: 7px 24px;
	margin: 10px;
`

const StyledText = styled.h3`
	color: white;
`
