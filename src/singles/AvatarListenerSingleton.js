import ObserverManager from "./parent/ObserverManager";

/**
 * Singleton class for managing observers and notifying them of updates.
 *
 * The class maintains a single instance and provides methods for adding, removing,
 * and notifying observers when an items update occurs.
 */
class AvatarListenerSingleton extends ObserverManager {

}

const avatarListenerSingletonInstance = new AvatarListenerSingleton();
export default avatarListenerSingletonInstance;
