import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Types "types";

actor PivotFlow {
    private stable var users : [(Principal, Types.User)] = [];
    private stable var nftAlerts : [(Text, Types.NFTAlert)] = [];
    private stable var gasAlerts : [(Text, Types.GasAlert)] = [];
    private stable var networkFees : [(Text, Types.NetworkFee)] = [];
    private stable var isInitialized : Bool = false;

    private var userStore = HashMap.HashMap<Principal, Types.User>(10, Principal.equal, Principal.hash);
    private var nftAlertStore = HashMap.HashMap<Text, Types.NFTAlert>(10, Text.equal, Text.hash);
    private var gasAlertStore = HashMap.HashMap<Text, Types.GasAlert>(10, Text.equal, Text.hash);
    private var networkFeeStore = HashMap.HashMap<Text, Types.NetworkFee>(10, Text.equal, Text.hash);

    // Initialize stores from stable memory
    private func initStores() {
        for ((k, v) in users.vals()) {
            userStore.put(k, v);
        };
        for ((k, v) in nftAlerts.vals()) {
            nftAlertStore.put(k, v);
        };
        for ((k, v) in gasAlerts.vals()) {
            gasAlertStore.put(k, v);
        };
        for ((k, v) in networkFees.vals()) {
            networkFeeStore.put(k, v);
        };
    };

    // Initialize default data
    private func initializeDefaultData() {
        initStores();
        
        // Initialize with some default network fees
        let ethFee : Types.NetworkFee = {
            blockchain = "Ethereum";
            icon = "eth-icon";
            fast = { gwei = 50.0; usd = 12.5 };
            standard = { gwei = 30.0; usd = 7.5 };
            slow = { gwei = 20.0; usd = 5.0 };
            lastUpdated = Time.now();
        };
        
        networkFeeStore.put("ethereum", ethFee);
    };

    // User management
    public shared(msg) func createUser(_username: Text) : async Types.User {
        let user : Types.User = {
            principal = msg.caller;
            createdAt = Time.now();
            lastLogin = Time.now();
            isOperator = false;
        };
        
        userStore.put(msg.caller, user);
        user
    };

    public shared(msg) func getUser() : async ?Types.User {
        userStore.get(msg.caller)
    };

    // Network fees
    public query func getNetworkFees() : async [Types.NetworkFee] {
        Iter.toArray(networkFeeStore.vals())
    };

    public shared(_msg) func updateNetworkFee(
        blockchain: Text,
        fast: Types.FeeInfo,
        standard: Types.FeeInfo,
        slow: Types.FeeInfo
    ) : async Types.NetworkFee {
        let fee : Types.NetworkFee = {
            blockchain;
            icon = blockchain # "-icon";
            fast;
            standard;
            slow;
            lastUpdated = Time.now();
        };
        
        networkFeeStore.put(Text.toLowercase(blockchain), fee);
        fee
    };

    // NFT Alerts
    public shared(msg) func createNFTAlert(
        collectionSlug: Text,
        collectionName: Text,
        alertType: Types.AlertType,
        targetPrice: Float,
        currency: Text
    ) : async Types.NFTAlert {
        let id = Text.concat(Principal.toText(msg.caller), collectionSlug);
        let alert : Types.NFTAlert = {
            id;
            userId = msg.caller;
            collectionSlug;
            collectionName;
            alertType;
            targetPrice;
            currentFloorPrice = targetPrice;
            currency;
            gasLimit = null;
            lastChecked = Time.now();
            isActive = true;
            percentageChange = null;
            createdAt = Time.now();
        };
        
        nftAlertStore.put(id, alert);
        alert
    };

    public shared(msg) func getUserNFTAlerts() : async [Types.NFTAlert] {
        let allAlerts = Iter.toArray(nftAlertStore.entries());
        Array.mapFilter<(Text, Types.NFTAlert), Types.NFTAlert>(
            allAlerts,
            func((_, alert)) = if (alert.userId == msg.caller) ?alert else null
        )
    };

    // Gas Alerts
    public shared(msg) func createGasAlert(
        blockchain: Text,
        maxGwei: Nat,
        priorityTier: Types.PriorityTier
    ) : async Types.GasAlert {
        let id = Text.concat(Principal.toText(msg.caller), blockchain);
        let alert : Types.GasAlert = {
            id;
            userId = msg.caller;
            blockchain;
            maxGwei;
            priorityTier;
            isActive = true;
            createdAt = Time.now();
        };
        
        gasAlertStore.put(id, alert);
        alert
    };

    public shared(msg) func getUserGasAlerts() : async [Types.GasAlert] {
        let allAlerts = Iter.toArray(gasAlertStore.entries());
        Array.mapFilter<(Text, Types.GasAlert), Types.GasAlert>(
            allAlerts,
            func((_, alert)) = if (alert.userId == msg.caller) ?alert else null
        )
    };

    // System upgrade functions
    system func preupgrade() {
        users := Iter.toArray(userStore.entries());
        nftAlerts := Iter.toArray(nftAlertStore.entries());
        gasAlerts := Iter.toArray(gasAlertStore.entries());
        networkFees := Iter.toArray(networkFeeStore.entries());
    };

    system func postupgrade() {
        if (not isInitialized) {
            initializeDefaultData();
            isInitialized := true;
        };
    };
}
