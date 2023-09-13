<?php
use PrestaShop\PrestaShop\Adapter\SymfonyContainer;

if (!defined('_PS_VERSION_')) {
    exit;
}
class advancedattributepricehandling extends Module
{
    const HOOKS = [
        'displayAdminProductsQuantitiesStepBottom',
        'ActionAdminControllerSetMedia',
    ];
    public function __construct()
    {
        $this->name = 'advancedattributepricehandling';
        $this->tab = 'back_office_features';
        $this->version = '1.0.0';
        $this->author = 'Kamil Nehrybecki';
        $this->need_instance = 1;
        $this->bootstrap = true;
        parent::__construct();
        $this->default_language = Language::getLanguage(Configuration::get('PS_LANG_DEFAULT'));
        $this->displayName = $this->trans('Advanced Attribute Price Handling', [], 'Modules.CustomAttribute.Admin');
        $this->description = $this->trans('Add price to attribute', [], 'Modules.CustomAttribute.Admin');
        $this->confirmUninstall = $this->trans('this module uninstaller', [], 'Modules.CustomAttribute.Admin');
        $this->ps_versions_compliancy = ['min' => '8.0.0', 'max' => '9.99.99'];

    }
    public function install()
    {
        return parent::install()
            && $this->registerHook(static::HOOKS);
    }
    public function uninstall()
    {
        return parent::uninstall();
    }
    public function hookActionAdminControllerSetMedia()
    {
        $this->context->controller->addCss($this->getPathUri() . 'views/css/backoffice.css');

        $this->context->controller->addJs($this->getPathUri() . 'views/js/backoffice.js');
    }
    public function checkTaxRate($params)
    {
        $id_product = $params['id_product'];
        $product = new Product($id_product);
        $currentTaxRate = $product->getTaxesRate();

        return $currentTaxRate;
    }
    public function hookDisplayAdminProductsQuantitiesStepBottom($params)
    {
        $currentTaxRate = $this->checkTaxRate($params);

        $nextCombination = AdvancedAttribute::checkNextIdCombination();

        $this->context->smarty->assign([
            'nextCombination' => $nextCombination,
            'taxInfo' => $currentTaxRate,
        ]);

        return $this->fetch('module:advancedattributepricehandling/views/templates/admin/form_combinations.html.twig');
    }
}