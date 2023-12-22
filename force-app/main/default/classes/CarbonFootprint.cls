public with sharing class CarbonFootprint {
    
    @AuraEnabled
    public static Integer calculateFootprint() {
        Integer footprint = 100; // Supongamos que calculamos la huella de carbono y obtenemos un valor de ejemplo
        return footprint;
    }
}