<?php

class AdvancedAttribute extends ObjectModel
{
    public static function checkNextIdCombination()
    {
        $db = Db::getInstance();
        $query = 'SELECT DATABASE()';
        $dbName = $db->getValue($query);
        $nextCombination = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$dbName' AND TABLE_NAME = '" . _DB_PREFIX_ . "product_attribute'";

        return Db::getInstance()->getValue($nextCombination);

    }
}