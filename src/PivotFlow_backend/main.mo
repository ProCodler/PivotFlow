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
    private stable var cyclesAlerts : [(Text, Types.CyclesAlert)] = [];
    private stable var networkFees : [(Text, Types.NetworkFee)] = [];
    private stable var isInitialized : Bool = false;

    private var userStore = HashMap.HashMap<Principal, Types.User>(10, Principal.equal, Principal.hash);
    private var nftAlertStore = HashMap.HashMap<Text, Types.NFTAlert>(10, Text.equal, Text.hash);
    private var cyclesAlertStore = HashMap.HashMap<Text, Types.CyclesAlert>(10, Text.equal, Text.hash);
    private var networkFeeStore = HashMap.HashMap<Text, Types.NetworkFee>(10, Text.equal, Text.hash);

    // Initialize stores from stable memory
    private func initStores() {
        for ((k, v) in users.vals()) {
            userStore.put(k, v);
        };
        for ((k, v) in nftAlerts.vals()) {
            nftAlertStore.put(k, v);
        };
        for ((k, v) in cyclesAlerts.vals()) {
            cyclesAlertStore.put(k, v);
        };
        for ((k, v) in networkFees.vals()) {
            networkFeeStore.put(k, v);
        };
    };

    // Initialize default data
    private func initializeDefaultData() {
        initStores();

        // Initialize with some default ICP Chain Fusion operation costs
        let canisterCallFee : Types.NetworkFee = {
            operationType = "Canister Call";
            icon = "canister-icon";
            fast = { cycles = 1000000.0; usd = 0.001 };
            standard = { cycles = 500000.0; usd = 0.0005 };
            slow = { cycles = 250000.0; usd = 0.00025 };
            lastUpdated = Time.now();
        };

        let httpRequestFee : Types.NetworkFee = {
            operationType = "HTTP Outcall";
            icon = "http-icon";
            fast = { cycles = 5000000.0; usd = 0.005 };
            standard = { cycles = 3000000.0; usd = 0.003 };
            slow = { cycles = 1500000.0; usd = 0.0015 };
            lastUpdated = Time.now();
        };

        let storageUpdateFee : Types.NetworkFee = {
            operationType = "Storage Update";
            icon = "storage-icon";
            fast = { cycles = 2000000.0; usd = 0.002 };
            standard = { cycles = 1000000.0; usd = 0.001 };
            slow = { cycles = 500000.0; usd = 0.0005 };
            lastUpdated = Time.now();
        };

        networkFeeStore.put("canister-call", canisterCallFee);
        networkFeeStore.put("http-outcall", httpRequestFee);
        networkFeeStore.put("storage-update", storageUpdateFee);
    };

    // User management
    public shared (msg) func createUser(_username : Text) : async Types.User {
        let user : Types.User = {
            principal = msg.caller;
            createdAt = Time.now();
            lastLogin = Time.now();
            isOperator = false;
        };

        userStore.put(msg.caller, user);
        user;
    };

    public shared (msg) func getUser() : async ?Types.User {
        userStore.get(msg.caller);
    };

    // Network fees
    public query func getNetworkFees() : async [Types.NetworkFee] {
        Iter.toArray(networkFeeStore.vals());
    };

    public shared (_msg) func updateNetworkFee(
        operationType : Text,
        fast : Types.CyclesCostInfo,
        standard : Types.CyclesCostInfo,
        slow : Types.CyclesCostInfo,
    ) : async Types.NetworkFee {
        let fee : Types.NetworkFee = {
            operationType;
            icon = operationType # "-icon";
            fast;
            standard;
            slow;
            lastUpdated = Time.now();
        };

        networkFeeStore.put(Text.toLowercase(operationType), fee);
        fee;
    };

    // NFT Alerts
    public shared (msg) func createNFTAlert(
        collectionSlug : Text,
        collectionName : Text,
        alertType : Types.AlertType,
        targetPrice : Float,
        currency : Text,
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
        alert;
    };

    public shared (msg) func getUserNFTAlerts() : async [Types.NFTAlert] {
        let allAlerts = Iter.toArray(nftAlertStore.entries());
        Array.mapFilter<(Text, Types.NFTAlert), Types.NFTAlert>(
            allAlerts,
            func((_, alert)) = if (alert.userId == msg.caller) ?alert else null,
        );
    };

    // Cycles Alerts
    public shared (msg) func createCyclesAlert(
        operationType : Text,
        maxCyclesCost : Nat,
        priorityTier : Types.PriorityTier,
    ) : async Types.CyclesAlert {
        let id = Text.concat(Principal.toText(msg.caller), operationType);
        let alert : Types.CyclesAlert = {
            id;
            userId = msg.caller;
            operationType;
            maxCyclesCost;
            priorityTier;
            isActive = true;
            createdAt = Time.now();
        };

        cyclesAlertStore.put(id, alert);
        alert;
    };

    public shared (msg) func getUserCyclesAlerts() : async [Types.CyclesAlert] {
        let allAlerts = Iter.toArray(cyclesAlertStore.entries());
        Array.mapFilter<(Text, Types.CyclesAlert), Types.CyclesAlert>(
            allAlerts,
            func((_, alert)) = if (alert.userId == msg.caller) ?alert else null,
        );
    };

    // Manual initialization for testing
    public func initialize() : async Text {
        if (not isInitialized) {
            initializeDefaultData();
            isInitialized := true;
            "Initialized successfully";
        } else {
            "Already initialized";
        };
    };

    // System upgrade functions
    system func preupgrade() {
        users := Iter.toArray(userStore.entries());
        nftAlerts := Iter.toArray(nftAlertStore.entries());
        cyclesAlerts := Iter.toArray(cyclesAlertStore.entries());
        networkFees := Iter.toArray(networkFeeStore.entries());
    };

    system func postupgrade() {
        if (not isInitialized) {
            initializeDefaultData();
            isInitialized := true;
        };
    };
};
